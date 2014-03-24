<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:opf="http://www.idpf.org/2007/opf"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:dcterms="http://purl.org/dc/terms/"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    version="2.0">

  <xsl:output method="xml" encoding="utf-8" omit-xml-declaration="no" indent="yes"/>

    <xsl:template match="/">
    
        <metadata>
          <dc:title><xsl:apply-templates select="//tei:titleStmt/tei:title" /></dc:title>
          <dc:creator><xsl:apply-templates select="//tei:titleStmt/tei:author" /></dc:creator>
          <dc:language xsi:type="dcterms:RFC3066">en-US</dc:language> 
      </metadata>
    


      

       </xsl:template>



</xsl:stylesheet>