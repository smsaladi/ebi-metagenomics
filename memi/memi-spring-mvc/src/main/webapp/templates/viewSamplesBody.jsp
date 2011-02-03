<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="spring" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<div id="content">
    <h2>Overview about all samples</h2>

    <div align="center">
        <table border="0" style="border-width: 1px;border-color: #000000;border-style: solid;">
            <form:form method="GET" action="${baseURL}/viewSamples/doSearch" commandName="sampleFilter">
                <tr>
                    <td>Text:</td>
                    <td><form:input path="searchTerm"/></td>
                    <td><form:errors path="searchTerm" cssClass="error"/></td>
                </tr>
                <tr>
                    <td>Privacy:</td>
                    <td><form:select id="sampleVisibility" path="sampleVisibility">
                        <form:options items="${mgModel.sampleVisibilityList}"/>
                    </form:select></td>
                </tr>
                <td></td>
                <td align="right">
                    <input type="submit" name="clear" value="Clear"/>
                </td>
                <td>
                    <input type="submit" name="search" value="Search"/>
                </td>
                </tr>
            </form:form>
        </table>
    </div>
    <div style="margin-top:40px"></div>
    <div align="left">
        <a href="<c:url value="${baseURL}/viewSamples/doExport"/>">Export to CSV</a>
    </div>

    <table border="1" width="95%">
        <tr>
            <th>No.</th>
            <th>Sample Id</th>
            <%--<c:if test="${not empty mgModel.submitter}">--%>
            <th>Privacy</th>
            <%--</c:if>--%>
            <th>Sample name</th>
            <th>Collection date</th>
            <th>Valid meta data</th>
            <th>Valid raw data</th>
            <th>Analysis completed</th>
            <th>Archived in ENA</th>
        </tr>
        <%
            int i = 1;
        %>
        <c:forEach var="sample" items="${mgModel.samples}" varStatus="status">
            <tr>
                <td align="center"><%= i%><% i++;%></td>
                <td>
                    <a href="<c:url value="${baseURL}/sampleOverview/${sample.id}"/>">${sample.sampleId}</a>
                </td>
                    <%--<c:if test="${not empty mgModel.submitter}">--%>
                <td>${sample.public}</td>
                    <%--</c:if>--%>
                <td>${sample.sampleTitle}</td>
                <td>
                    <c:choose>
                        <c:when test="${empty sample.collectionDate}">N/A</c:when>
                        <c:otherwise>${sample.collectionDate}</c:otherwise>
                    </c:choose>
                </td>
                <td>
                    <c:choose>
                        <c:when test="${empty sample.metadataReceived}">N/A</c:when>
                        <c:otherwise>${sample.metadataReceived}</c:otherwise>
                    </c:choose>
                </td>
                <td>
                    <c:choose>
                        <c:when test="${empty sample.sequenceDataReceived}">N/A</c:when>
                        <c:otherwise>${sample.sequenceDataReceived}</c:otherwise>
                    </c:choose>
                </td>
                <td>
                    <c:choose>
                        <c:when test="${empty sample.analysisCompleted}">N/A</c:when>
                        <c:otherwise>${sample.analysisCompleted}</c:otherwise>
                    </c:choose>
                </td>
                <td>
                    <c:choose>
                        <c:when test="${empty sample.sequenceDataArchived}">N/A</c:when>
                        <c:otherwise>${sample.sequenceDataArchived}</c:otherwise>
                    </c:choose>
                </td>
            </tr>
        </c:forEach>
    </table>
</div>