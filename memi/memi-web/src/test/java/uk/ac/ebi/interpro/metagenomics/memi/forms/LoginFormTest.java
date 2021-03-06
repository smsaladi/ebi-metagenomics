package uk.ac.ebi.interpro.metagenomics.memi.forms;

import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

/**
 * Represents the JUnit test for {@link uk.ac.ebi.interpro.metagenomics.memi.forms.LoginForm}
 *
 * @author Maxim Scheremetjew, EMBL-EBI, InterPro
 * @version $Id$
 * @since 1.0-SNAPSHOT
 */
public class LoginFormTest {
    private LoginForm form;

    @Before
    public void setUp() throws Exception {
        form = new LoginForm();
    }

    @Test
    public void testSetterAndGetter() {
        String userName = "test@testmail.com";
        form.setUserName(userName);
        assertEquals(userName, form.getUserName());
        String pw = "testPassword";
        form.setPassword(pw);
        assertEquals(pw, form.getPassword());
    }
}