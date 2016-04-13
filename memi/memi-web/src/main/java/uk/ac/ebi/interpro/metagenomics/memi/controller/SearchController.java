package uk.ac.ebi.interpro.metagenomics.memi.controller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import uk.ac.ebi.interpro.metagenomics.memi.core.tools.EBISearchTool;
import uk.ac.ebi.interpro.metagenomics.memi.forms.EBISearchForm;
import uk.ac.ebi.interpro.metagenomics.memi.model.hibernate.SecureEntity;
import uk.ac.ebi.interpro.metagenomics.memi.springmvc.model.Breadcrumb;
import uk.ac.ebi.interpro.metagenomics.memi.springmvc.model.ViewModel;
import uk.ac.ebi.interpro.metagenomics.memi.springmvc.model.ebiSearch.EBISampleSearchResults;
import uk.ac.ebi.interpro.metagenomics.memi.springmvc.modelbuilder.SearchViewModelBuilder;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by maq on 17/03/2016.
 */
@Controller
@RequestMapping(value = "/" + SearchController.VIEW_NAME)
public class SearchController extends AbstractController implements IController {
    private final Log log = LogFactory.getLog(SearchController.class);

    public static final String VIEW_NAME = "search";

    public static final String VIEW_SEARCH = "doEbiSearch";

    public EBISearchTool ebiSearchTool;

    public SearchController() {
        ebiSearchTool = new EBISearchTool();
    }

    @Override
    public ModelAndView doGet(final ModelMap model) {
        log.info("Requesting doGet of " + this.getClass() +  "...");
        final EBISampleSearchResults sampleSearchResults;
        EBISearchForm ebiSearchForm = getEBISearchForm();
        if (ebiSearchForm != null && ebiSearchForm.getSearchText() != null) {
            sampleSearchResults = ebiSearchTool.searchSamples(ebiSearchForm);
        } else {
            sampleSearchResults = new EBISampleSearchResults();
        }
        return buildModelAndView(
            getModelViewName(),
            model,
            new ModelPopulator() {
                @Override
                public void populateModel(ModelMap model) {
                    log.info("Building model of " + this.getClass() +  "...");
                    final SearchViewModelBuilder<ViewModel> builder = new SearchViewModelBuilder(
                            sessionManager,
                            "Search EBI metagenomics",
                            getBreadcrumbs(null),
                            propertyContainer,
                            sampleSearchResults
                    );
                    final ViewModel searchModel = builder.getModel();
                    searchModel.changeToHighlightedClass(ViewModel.TAB_CLASS_SEARCH_VIEW);
                    model.addAttribute(ViewModel.MODEL_ATTR_NAME, searchModel);
                }
            }
        );
    }

    @RequestMapping(value = "/" + SearchController.VIEW_SEARCH)
    public ModelAndView doEbiSearch(@Valid @ModelAttribute(EBISearchForm.MODEL_ATTR_NAME) final EBISearchForm ebiSearchForm,
                                    BindingResult result,
                                    ModelMap model) {
        log.info("Requesting doEbiSearch of " + this.getClass() +  "...");

        final EBISampleSearchResults sampleSearchResults = ebiSearchTool.searchSamples(ebiSearchForm);
        return buildModelAndView(
                getModelViewName(),
                model,
                new ModelPopulator() {
                    @Override
                    public void populateModel(ModelMap model) {
                        log.info("Building model of " + this.getClass() +  "...");
                        final SearchViewModelBuilder<ViewModel> builder = new SearchViewModelBuilder(
                                sessionManager,
                                "Search EBI metagenomics",
                                getBreadcrumbs(null),
                                propertyContainer,
                                sampleSearchResults
                        );
                        final ViewModel searchModel = builder.getModel();
                        searchModel.changeToHighlightedClass(ViewModel.TAB_CLASS_SEARCH_VIEW);
                        model.addAttribute(EBISearchForm.MODEL_ATTR_NAME, ebiSearchForm);
                        model.addAttribute(ViewModel.MODEL_ATTR_NAME, searchModel);
                    }
                }
        );
    }

    /**
     * Creates the MG model and adds it to the specified model map.
     */
    private void populateModel(final ModelMap model,
                               EBISearchForm ebiSearchForm,
                               EBISampleSearchResults sampleSearchResults
    ) {
        log.info("Building model of " + this.getClass() +  "...");
        final SearchViewModelBuilder<ViewModel> builder = new SearchViewModelBuilder(
                sessionManager,
                "Search EBI metagenomics",
                getBreadcrumbs(null),
                propertyContainer,
                sampleSearchResults
        );
        final ViewModel searchModel = builder.getModel();
        searchModel.changeToHighlightedClass(ViewModel.TAB_CLASS_SEARCH_VIEW);
        model.addAttribute(ViewModel.MODEL_ATTR_NAME, searchModel);
        model.addAttribute(EBISearchForm.MODEL_ATTR_NAME, ebiSearchForm);
    }

    protected String getModelViewName() {
        return VIEW_NAME;
    }

    protected List<Breadcrumb> getBreadcrumbs(SecureEntity entity) {
        List<Breadcrumb> result = new ArrayList<Breadcrumb>();
        result.add(new Breadcrumb("Search", "Search the Metagenomics portal", VIEW_NAME));
        return result;
    }
}