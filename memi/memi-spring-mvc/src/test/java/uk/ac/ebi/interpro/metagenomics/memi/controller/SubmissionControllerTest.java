package uk.ac.ebi.interpro.metagenomics.memi.controller;

import junit.framework.TestCase;
import org.apache.velocity.app.VelocityEngine;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.support.SimpleSessionStatus;
import uk.ac.ebi.interpro.metagenomics.memi.forms.SubmissionForm;

import javax.annotation.Resource;
import java.lang.reflect.Field;

/**
 * Represents the unit test for the {@link SubmissionController}.
 *
 * @author Maxim Scheremetjew, EMBL-EBI, InterPro
 * @version $Id$
 * @since 1.0-SNAPSHOT
 */
//TODO: Find a way to simulate POST requests. We can not use class MockHttpServletRequest, because our controller uses annotation-based controller implementation instead of the old controller interface.
//If there is a way you can e.g. test empty input fields
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration
public class SubmissionControllerTest extends TestCase {

    private SubmissionController controller;

    @Resource(name = "emailNotificationTestService")
    private EmailNotificationTestService emailTestService;

    @Resource(name = "velocityTestEngine")
    private VelocityEngine velocityTestEngine;

    @Before
    public void setUp() throws Exception {
        controller = new SubmissionController();

        //Replace email service
        Field emailServiceField = SubmissionController.class.
                getDeclaredField("emailService");
        emailServiceField.setAccessible(true);
        emailServiceField.set(controller, emailTestService);
        //Replace velocityEngine
        Field velocityEngineField = SubmissionController.class.
                getDeclaredField("velocityEngine");
        velocityEngineField.setAccessible(true);
        velocityEngineField.set(controller, velocityTestEngine);
    }

    @Test
    public void testInitForm() throws Exception {
        ModelMap model = new ModelMap();
        assertEquals("submissionForm", controller.initForm(model));
        assertEquals(1, model.size());
        assertTrue(model.containsKey("subForm"));
        assertFalse(model.containsKey("test"));
        SubmissionForm subForm = (SubmissionForm) model.get("subForm");
        assertNotNull(subForm);
        assertNull("All input fields should be null at initialization phase!", subForm.getSubTitle());
        assertNotNull("Date is set during initialization!", subForm.getReleaseDate());
        assertNull("All input fields should be null at initialization phase!", subForm.getDataDesc());
        assertFalse("All checkboxes should be false at initialization phase!", subForm.isAnalysisRequired());
        assertFalse("All checkboxes should be false at initialization phase!", subForm.isHumanAssociated());
    }

    @Test
    public void testProcessSubmit() throws Exception {
        SubmissionForm subForm = new SubmissionForm();
        ModelMap model = new ModelMap();
        BindingResult result = new BeanPropertyBindingResult(subForm, "subForm");
        //1. test case: no submission form object provided
        assertEquals("If the submission form bean is not attached at the model a NPE will occur!", "errorPage", controller.processSubmit(subForm, result, model, new SimpleSessionStatus()));
        //2. test case: Input fields contain data
        String testTitle = "test title";
        String testDate = "20/12/2010";
        String testDescription = "test description";
        boolean isAnalysisRequired = false;
        boolean isHumanAssociated = true;
        subForm.setSubTitle(testTitle);
        subForm.setReleaseDate(testDate);
        subForm.setDataDesc(testDescription);
        subForm.setAnalysisRequired(isAnalysisRequired);
        subForm.setHumanAssociated(isHumanAssociated);
        model.put("subForm", subForm);
        result = new BeanPropertyBindingResult(subForm, "subForm");
        assertEquals(0, result.getErrorCount());
        assertEquals("submissionSuccessPage", controller.processSubmit(subForm, result, model, new SimpleSessionStatus()));
        assertEquals(1, model.size());
        assertTrue(model.containsKey("subForm"));
        assertEquals(0, result.getErrorCount());
        SubmissionForm modelSubFormObj = (SubmissionForm) model.get("subForm");
        assertEquals("The content of the submission title input field should not be null!", testTitle, modelSubFormObj.getSubTitle());
        assertEquals("The content of the submission explanation input field should not be null!", testDate, modelSubFormObj.getReleaseDate());
        assertEquals("The content of the data description input field should not be null!", testDescription, modelSubFormObj.getDataDesc());
        assertEquals("The checkbox should be not clicked (FALSE)!", isAnalysisRequired, modelSubFormObj.isAnalysisRequired());
        assertEquals("The checkbox should be clicked (TRUE)!", isHumanAssociated, modelSubFormObj.isHumanAssociated());
    }

    @Test
    public void testBuildMsg() {
        SubmissionForm subForm = new SubmissionForm();
        String testTitle = "test title";
        String testDate = "20/12/2010";
        String testDescription = "test description";
        boolean isAnalysisRequired = true;
        boolean isHumanAssociated = true;
        subForm.setSubTitle(testTitle);
        subForm.setReleaseDate(testDate);
        subForm.setDataDesc(testDescription);
        subForm.setAnalysisRequired(isAnalysisRequired);
        subForm.setHumanAssociated(isHumanAssociated);
        String actual = controller.buildMsg(subForm);
        //Test the static part of the email content
        assertTrue(actual.contains("Submitter name:"));
        assertTrue(actual.contains("Submission title:"));
        assertTrue(actual.contains("Release date:"));
        assertTrue(actual.contains("Data description:"));
        assertTrue(actual.contains("Is analysis required:"));
        assertTrue(actual.contains("Is Human associated:"));
        //Test if submission form values are part of the message text        
        assertTrue(actual.contains(testTitle));
        assertTrue(actual.contains(testDate));
        assertTrue(actual.contains(testDescription));
        assertTrue(actual.contains("true"));
        assertFalse(actual.contains("false"));
        assertFalse("Should not be a part of the message text!", actual.contains("hallo"));
    }
}