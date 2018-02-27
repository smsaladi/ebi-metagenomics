'''
Created on 27/10/2015
@author: Maxim Scheremetjew
amended 07/11/2016 by Maxim Scheremetjew
version: 1.1
'''

from __future__ import print_function

import argparse
import csv
import os
import os.path

import urllib.request
import urllib.parse
import urllib.error
import urllib.request
import urllib.error
import urllib.parse
from urllib.error import URLError


def _download_resource_by_url(url, output_file_name, raiseError=True):
    """Kicks off a download and stores the file at the given path.
    Arguments:
    'url' -- Resource location.
    'output_file_name' -- Path of the output file.
    """
    print("Starting the download of the following file...")
    print(url)
    print("Saving file in:\n" + output_file_name)

    try:
        urllib.request.urlretrieve(url, output_file_name)
    except Exception as err:
        print(err)
        if raiseError:
            raise err
    print("Download finished.")


def _get_number_of_chunks(url_template, study_id, sample_id, run_id, version, domain, file_type, raiseError=True):
    """
    Returns the number of chunks for the given set of parameters (study, sample and run identifier).
    """
    print("Getting the number of chunks from the following URL...")
    url_get_number_of_chunks = url_template % (
        study_id, sample_id, run_id, version, domain, file_type)
    print(url_get_number_of_chunks)
    try:
        file_stream_handler = urllib.request.urlopen(url_get_number_of_chunks)
        result = int(file_stream_handler.read())
        print("Retrieved " + str(result) + " chunks.")
        return result
    except ValueError as e:
        print(e)
        print("Skipping this run! Could not retrieve the number of chunks for this URL. "
              "Check the version number in the URL and check if the run is available online.")
        return 0
    except Exception as err:
        print(err)
        if raiseError:
            raise err


def _get_file_stream_handler(url_template, study_id, raiseError=True):
    """
    Returns a file stream handler for the given URL.
    """
    print("Getting the list of project runs...")
    url_get_project_runs = url_template % (study_id)
    try:
        req = urllib.request.Request(url=url_get_project_runs, headers={
                                     'Content-Type': 'text/plain'})
        return urllib.request.urlopen(req)
    except ValueError as err:
        print(err)
        print("Could not retrieve any runs. Open the retrieval URL further down in your browser and see if you get any results back. Program will exit now.")
        print(url_get_project_runs)
        if raiseError:
            raise err
    except Exception as err:
        print(err)
        if raiseError:
            raise err


def _print_program_settings(project_id, version, selected_file_types_list, output_path, root_url):
    print("Running the program with the following setting...")
    print("Project: " + project_id)
    print("Pipeline version: " + version)
    print("Selected file types: " + ",".join(selected_file_types_list))
    print("Root URL: " + root_url)
    print("Writing result to: " + output_path)


def _get_file_info(file_type):
    domain = None
    fileExtension = None
    is_chunked = True
    # Set the result file domain (sequences, function or taxonomy) dependent on the file type
    # Set output file extension (tsv, faa or fasta) dependent on the file
    if file_type == 'InterProScan':
        domain = "function"
        fileExtension = ".tsv.gz"
    elif file_type in ['GOSlimAnnotations', 'GOAnnotations']:
        domain = "function"
        fileExtension = ".csv"
        is_chunked = False
    elif file_type in ['PredictedCDS', 'PredictedCDSWithoutAnnotation', 'PredictedCDSWithAnnotation']:
        domain = "sequences"
        fileExtension = ".faa.gz"
    elif file_type == 'ncRNA-tRNA-FASTA':
        domain = "sequences"
        fileExtension = ".fasta"
        is_chunked = False
    elif file_type in ['5S-rRNA-FASTA', '16S-rRNA-FASTA', '23S-rRNA-FASTA']:
        is_chunked = False
        domain = "taxonomy"
        fileExtension = ".fasta"
    elif file_type in ['NewickPrunedTree', 'NewickTree']:
        is_chunked = False
        domain = "taxonomy"
        fileExtension = ".tree"
    elif file_type == 'OTU-TSV':
        is_chunked = False
        domain = "taxonomy"
        fileExtension = ".tsv"
    elif file_type in ['OTU-BIOM', 'OTU-table-HDF5-BIOM', 'OTU-table-JSON-BIOM']:
        is_chunked = False
        domain = "taxonomy"
        fileExtension = ".biom"
    else:
        domain = "sequences"
        fileExtension = ".fasta.gz"

    return domain, fileExtension, is_chunked


def main():
    function_file_type_list = ["InterProScan", "GOAnnotations",
                               "GOSlimAnnotations"]
    sequences_file_type_list = ["ProcessedReads", "ReadsWithPredictedCDS", "ReadsWithMatches", "ReadsWithoutMatches",
                                "PredictedCDS", "PredictedCDSWithoutAnnotation", "PredictedCDSWithAnnotation",
                                "PredictedORFWithoutAnnotation", "ncRNA-tRNA-FASTA"]
    taxonomy_file_type_list = ["5S-rRNA-FASTA", "16S-rRNA-FASTA", "23S-rRNA-FASTA", "OTU-TSV", "OTU-BIOM",
                               "OTU-table-HDF5-BIOM", "OTU-table-JSON-BIOM", "NewickTree", "NewickPrunedTree"]

    file_categories = {"AllSequences": sequences_file_type_list,
                       "AllFunction": function_file_type_list,
                       "AllTaxonomy": taxonomy_file_type_list}

    parser = argparse.ArgumentParser(
        description="EBI Metagenomics Portal bulk download tool")
    parser.add_argument("-p", "--project_id",
        help="Project accession (e.g. ERP001736, SRP000319) from a project which is publicly available at https://www.ebi.ac.uk/metagenomics/projects",
        required=True)
    parser.add_argument("-o", "--output_path",
        help="Location of the output directory, where the downloadable files get stored",
        required=True)
    parser.add_argument("-v", "--version",
        help="Version of the pipeline used to generate the results",
        required=True)
    parser.add_argument("-t", "--file_types",
        help="File type(s) desired for download. Downloads all file types if not provided.",
        options=[*file_categories.keys(), *sequences_file_type_list, *function_file_type_list, *taxonomy_file_type_list],
        nargs='+',
        default=file_categories,
        required=False)
    parser.add_argument("-s", "--stoponerror",
        help="Raise and stop on error",
        action='store_true')
    parser.add_argument("-vb", "--verbose",
        help="Switches on the verbose mode. Doesn't do anything.",
        action='store_true')

    args = parser.parse_args()

    verbose = args.verbose
    study_id = args.project_id
    version = args.version

    # Parse the values file formats requested
    selected_file_types = set()
    for val in args.file_types:
        if val in file_categories.keys():
            selected_file_types.update(file_categories[val])
        else:
            selected_file_types.add(val)

    # Handle differences between pipeline versions
    # PredictedCDS is version 1.0 and 2.0 only
    # In v3.0, PredictedCDS was replaced by PredictedCDSWithAnnotation
    # (PredictedCDS can be gained by concatenation of
    #  PredictedCDSWithoutAnnotation and PredictedCDSWithAnnotation)
    if version in ['1.0', '2.0']:
        if 'PredictedCDSWithAnnotation' in selected_file_types:
            print("`PredictedCDSWithAnnotation` is not available for version " + version + ". Retrieving all `PredictedCDS`")
            selected_file_types.remove('PredictedCDSWithAnnotation')
            selected_file_types.add('PredictedCDS')
        if 'PredictedCDSWithoutAnnotation' in selected_file_types:
            print("`PredictedCDSWithoutAnnotation` is not available for version " + version + ". Retrieving all `PredictedCDS`")
            selected_file_types.remove('PredictedCDSWithoutAnnotation')
            selected_file_types.add('PredictedCDS')
    if version == '3.0' and 'PredictedCDS' in selected_file_types:
        print("`PredictedCDS` is not available for version " + version + ". Retrieving both `PredictedCDSWithoutAnnotation` and `PredictedCDSWithAnnotation`")
        selected_file_types.remove('PredictedCDS')
        selected_file_types.update(['PredictedCDSWithoutAnnotation', 'PredictedCDSWithAnnotation'])

    # NewickPrunedTree is version 2 only
    # NewickTree is version 1 only
    if version == '1.0' and 'NewickPrunedTree' in selected_file_types:
        print("`NewickPrunedTree` is not available for version " + version + ". Retrieving `NewickTree`")
        selected_file_types.remove('NewickPrunedTree')
        selected_file_types.add('NewickTree')
    if version == '2.0' and 'NewickTree' in selected_file_types:
        print("`NewickTree` is not available for version " + version + ". Retrieving `NewickPrunedTree`")
        selected_file_types.remove('NewickTree')
        selected_file_types.add('NewickPrunedTree')

    # OTU-BIOM is version 1 only
    # OTU-table-HDF5-BIOM and OTU-table-JSON-BIOM are version 2 only
    if version == '1.0':
        if 'OTU-table-HDF5-BIOM' in selected_file_types:
            print("`OTU-table-HDF5-BIOM` is not available for version " + version + ". Retrieving `OTU-BIOM`")
            selected_file_types.remove('OTU-table-HDF5-BIOM')
            selected_file_types.add('OTU-BIOM')
        if 'OTU-table-JSON-BIOM' in selected_file_types:
            print("`OTU-table-JSON-BIOM` is not available for version " + version + ". Retrieving `OTU-BIOM`")
            selected_file_types.remove('OTU-table-JSON-BIOM')
            selected_file_types.add('OTU-BIOM')
    if version == '2.0' and 'OTU-BIOM' in selected_file_types:
        print("`OTU-BIOM` is not available for version " + version + ". Retrieving `OTU-table-JSON-BIOM`")
        selected_file_types.remove('OTU-BIOM')
        selected_file_types.add('OTU-table-JSON-BIOM')

    selected_file_types = list(selected_file_types)

    root_url = "https://www.ebi.ac.uk"
    study_url_template = root_url + "/metagenomics/projects/%s/runs"
    number_of_chunks_url_template = root_url + \
        "/metagenomics/projects/%s/samples/%s/runs/%s/results/versions/%s/%s/%s/chunks"
    chunk_url_template = root_url + \
        "/metagenomics/projects/%s/samples/%s/runs/%s/results/versions/%s/%s/%s/chunks/%s"
    download_url_template = root_url + \
        "/metagenomics/projects/%s/samples/%s/runs/%s/results/versions/%s/%s/%s"

    # Print out the program settings
    _print_program_settings(study_id, version, selected_file_types,
                            args.output_path, root_url)

    # Iterating over all file types
    for file_type in selected_file_types:
        domain, fileExtension, is_chunked = _get_file_info(file_type)

        # Retrieve a file stream handler from the given URL and iterate over
        # each line (each run) and build the download link using the variables
        # from above
        file_stream_handler = _get_file_stream_handler(study_url_template, study_id, args.stoponerror)
        reader = csv.reader(file_stream_handler, delimiter=',')
        for study_id, sample_id, run_id in reader:
            print(study_id + ", " + sample_id + ", " + run_id)

            output_path = os.path.join(args.output_path, study_id, file_type)
            if not os.path.exists(output_path):
                os.makedirs(output_path)

            if is_chunked:
                number_of_chunks = _get_number_of_chunks(number_of_chunks_url_template, study_id, sample_id, run_id,
                                                         version, domain, file_type, args.stoponerror)

                for chunk in range(1, number_of_chunks + 1):
                    output_file_name = os.path.join(output_path,
                        "{}_{}_{}{}".format(run_id.replace(" ", "").replace(",", "-"), file_type, chunk, fileExtension))
                    rootUrl = chunk_url_template % (
                        study_id, sample_id, run_id, version, domain, file_type, chunk)
                    _download_resource_by_url(rootUrl, output_file_name, args.stoponerror)
            else:
                output_file_name = output_path + "/" + run_id.replace(" ", "").replace(",", "-") + "_" + file_type + fileExtension
                rootUrl = download_url_template % (study_id, sample_id, run_id, version, domain, file_type)
                _download_resource_by_url(rootUrl, output_file_name, args.stoponerror)

    print("Program finished.")

    return

if __name__ == "__main__":
    main()
