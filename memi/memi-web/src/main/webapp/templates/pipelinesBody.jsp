<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<h2>Pipeline release archive</h2>
<p>You will find here the list of pipelines that were used to run the analyses.</p>


<c:forEach var="pipelineRelease" items="${pipelineReleases}" varStatus="status">

<p class="pi_arch_title"><span><a href="<c:url value="${baseURL}/pipelines/${pipelineRelease.releaseVersion}"/>">Pipeline v.${pipelineRelease.releaseVersion}</a></span> (${pipelineRelease.releaseDate})</p>
    <c:choose>
        <c:when test="${pipelineRelease.releaseVersion == '4.1'}">
            <ul><li>Upgraded SeqPrep to v1.2 with increased sequence length parameter to deal with longer reads</li>
                <li>Upgraded MAPseq to v1.2.2</li>
                <li>Rebuilt taxonomic reference database based on SILVA v132</li>
                <li>Taxonomic assignments now also available in HDF5 format</li>
                <li>Applied fix to the coding sequence prediction step</li>
            </ul>
        </c:when>
        <c:when test="${pipelineRelease.releaseVersion == '4.0'}">
            <ul><li>Updated tools: InterProScan</li>
                <li>rRNASelector (used to identify 16S rRNA genes) was replaced with Infernal for SSU and LSU gene identification</li>
                <li>The QIIME taxonomic classification component was replaced with MAPseq</li>
                <li>The Greengenes reference database was replaced with SILVA SSU / LSU version 128, enabling classification of eukaryotes, remapped to a 8-level taxonomy</li>
                <li>Prodigal was added to run alongside FragGeneScan as part of a combined gene caller when processing assembled sequences</li>
            </ul>
        </c:when>
        <c:when test="${pipelineRelease.releaseVersion == '3.0'}">
                <ul><li>Updated tools: InterProScan, FraGeneScan, QIIME and Trimmomatic</li>
                    <li>Updated GO slim, based on the analysis of over 22 billion (22x10^9) billion functional annotations</li>
                    <li>Added identification and masking of transfer RNA genes</li>
                    <li>Improved quality control statistics (sequence length summary, GC and nucleotide distribution)</li></ul>
            </c:when>
        <c:when test="${pipelineRelease.releaseVersion == '2.0'}">
            <ul><li>Removed clustering step during the Quality control (QC)</li>
             <li>Added step to mask rRNA on reads (instead of removing reads with rRNA)</li>
             <li>Improved performance and tools update</li></ul>
        </c:when>
    </c:choose>
</c:forEach>
