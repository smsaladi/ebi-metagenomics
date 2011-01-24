package uk.ac.ebi.interpro.metagenomics.memi.springmvc.model;

import uk.ac.ebi.interpro.metagenomics.memi.dao.EmgStudyDAO;
import uk.ac.ebi.interpro.metagenomics.memi.dao.HibernateStudyDAO;
import uk.ac.ebi.interpro.metagenomics.memi.dao.NewsDAO;
import uk.ac.ebi.interpro.metagenomics.memi.model.EmgStudy;
import uk.ac.ebi.interpro.metagenomics.memi.model.News;
import uk.ac.ebi.interpro.metagenomics.memi.model.Submitter;
import uk.ac.ebi.interpro.metagenomics.memi.model.hibernate.Study;
import uk.ac.ebi.interpro.metagenomics.memi.springmvc.session.SessionManager;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a Metagenomics model factory. Use this factory if you want to create a {@link MGModel}.
 *
 * @author Maxim Scheremetjew, EMBL-EBI, InterPro
 * @since 1.0-SNAPSHOT
 */
public class MGModelFactory {
    //Final variables
    /**
     * The number studies, which should be shown on the portal home page.
     */
    private final static int rowNumberForStudies = 10;

    private MGModelFactory() {

    }

    public static HomePageModel getHomePageModel(SessionManager sessionMgr, HibernateStudyDAO studyDAO, NewsDAO newsDAO) {
        return new HomePageModel(getSessionSubmitter(sessionMgr), getLimitedPublicStudiesFromDB(studyDAO), getNewsListFromDB(newsDAO));
    }

    public static MGModel getMGModel(SessionManager sessionMgr) {
        return new MGModel(getSessionSubmitter(sessionMgr));
    }

    public static SubmissionModel getSubmissionModel(SessionManager sessionMgr) {
        return new SubmissionModel(getSessionSubmitter(sessionMgr));
    }

    public static ListStudiesModel getListStudiesPageModel(SessionManager sessionMgr, HibernateStudyDAO studyDAO) {
        return new ListStudiesModel(getSessionSubmitter(sessionMgr), getAllPublicStudiesFromDB(studyDAO));
    }

    /**
     * Returns a list of public studies limited by a specified number of rows.
     */
    public static List<Study> getLimitedPublicStudiesFromDB(HibernateStudyDAO studyDAO) {
        List<Study> studies = null;
        if (studyDAO != null) {
            studies = studyDAO.retrieveStudiesLimitedByRows(rowNumberForStudies);
        }
        if (studies == null) {
            studies = new ArrayList<Study>();
        }
        return studies;
    }

    /**
     * Returns a list of all public studies with the MG database.
     */
    public static List<Study> getAllPublicStudiesFromDB(HibernateStudyDAO studyDAO) {
        List<Study> result = studyDAO.retrieveAll();
        if (result == null) {
            result = new ArrayList<Study>();
        }
        return result;
    }

    public static List<News> getNewsListFromDB(NewsDAO newsDAO) {
        List<News> newsList = newsDAO.getLatestNews();
        if (newsList == null) {
            newsList = new ArrayList<News>();
        }
        return newsList;
    }

    private static Submitter getSessionSubmitter(SessionManager sessionMgr) {
        return sessionMgr.getSessionBean().getSubmitter();
    }
}