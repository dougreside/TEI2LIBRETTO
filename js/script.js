	par="";
	counter = 0;
	totalSync=0;
	spine=[];
	expretry=1;
	xmlstrings = {};
	manifest = '<package xmlns="http://www.idpf.org/2007/opf" prefix="cc: http://creativecommons.org/ns# rendition: http://www.idpf.org/vocab/rendition/#" version="3.0" unique-identifier="bookid" id="package">';
	otherFiles = [];
	

    var scopes = ['https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/drive.file','https://spreadsheets.google.com/feeds'];
	xml = [];
	xsl=[];
	xslt = "";
	xsltp = "";
	headXSL = "";
	xsltHead = "";
	function getHeadXSL(){
	
	    var xhr = new XMLHttpRequest();
    xhr.open('GET', "./xsl/tei2opf.xsl");
    xhr.onload = function() {
    
        		xsltH = $.parseXML(xhr.responseText);
     		xsltHead = Saxon.newXSLT20Processor(xsltH);
     		
    };
      xhr.onerror = function() {

    };
    xhr.send();	
	
	
	
	}
	
	function getExtXSL(){
		xsls = $("#XSLFileList").find("li>input.xslcheck:checked").eq(0);
			
				x = $(xsls).attr("id").substring(4);
				if (xsl[x].url) {
  					
    			
		
			
	
	
	
	 url = xsl[x].url;
	 
	   var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = function() {
   
        		xslt = $.parseXML(xhr.responseText);
     		xsltp = Saxon.newXSLT20Processor(xslt);
    };
      xhr.onerror = function() {
      alert(null);
    };
    xhr.send();	
    } else {
   				 alert("Please upload an XSL file to the folder");
 				 }

	}
	
	 function finishing(){
	 			firstXML = _.toArray(xmlstrings)[0]; 

	 			hFrag = xsltHead.transformToFragment(firstXML["dom"]);
	 			console.log(hFrag);
	  	  		manifest = manifest+ new XMLSerializer().serializeToString(hFrag);
	  	  		$("#finishRow").html("<div>Loading...(give it a few seconds)</div>");	
				insertFolder(par,"EPUB",fillFolder);
 		}
 		 
 	  function fillFolder(data)
 	  {	
				
 	  			parId = data.id;
 	  			console.log("epub folder: "+JSON.stringify(data));
 	  			
 	  			manifest = manifest+"<manifest>";
				allchecks = $(".chapterSelect:checked").length;
				$("#finishRow").append("<div><span id='remaining'>"+allchecks+" files remaining.</span></div>");	
	  		
  				$(".chapterSelect:checked").each(function(key,val){
  				bigid = $(val).parent().attr("id");
	  			shortid = bigid.substring(bigid.indexOf("___")+3);
	  			head = bigid.substring(0,bigid.indexOf("___"));
  				
	  			xmlObj = xmlstrings[head];
	  			xmlD = xmlObj["dom"];
	  			
	  			chapter = $(xmlD).find("#"+shortid);
	  			headtitle = chapter.find("head").eq(0).text();
	  			
	  			frag =xsltp.transformToFragment(chapter[0]);
	  			sfrag = new XMLSerializer().serializeToString( frag );
	  			
	  			
	  			if (spine[head]==null){
	  			spine[head]=[];
	  			}
	  			spine[head].push(head+"-"+key);
	  			manifest = manifest+"<item href='"+head+"-"+key+".html' id='"+head+"-"+key+"' media-type='application/xhtml+xml'/>";
	  			xmlstrings[head]["chapters"].push({"id":head+"-"+key,"href":head+"-"+key+".html","title":headtitle});
	  			     
   				

   	
				
				
	  			setTimeout(function(){console.log(key+" +++++++++");insertFile(parId, sfrag, "text/html", head+"-"+key,fileUploaded)},key*1000);
	  			  
				console.log(key+" *************************");
	  			
 					
 				});
 				
 				
 	  }
 	  function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
 	  function fileUploaded(resp,title){
 	 				
 	  				/*if (resp.error){
 	  				if (expRetry<8){
 	  				 console.log(title);
 	  				delay= (Math.pow(2,expretry)*1000)+getRandomInt(1,1000);
 	  				expRetry++;
 	  				
 	  				console.log("Trying again in "+delay);
 	  				setTimeout(
	  					insertFile(parId, sfrag, "text/html", title,fileUploaded),delay);
	  					}
	  					else{
	  						console.log("Fail "+title);
	  								expRetry=0;
	  					}
	  				}
	  				else{
	  		*/
	  				allchecks--;
	  				$("#remaining").text(allchecks);
	  				if (allchecks==0){
	  				completeManifest(spine,parId);
	  				$("#finishRow").append("<div>Just a few more seconds...</div>");
	  				}
	  			//	}
 	  }
 	  function completeManifest(spine,parId){
 	  manifest = manifest+"<item id='toc' href='nav.xhtml' properties='nav' media-type='application/xhtml+xml'/>";

 	  	for (i in otherFiles){
 	 		o=otherFiles[i];
 	  		manifest = manifest+"<item href='"+o.path+o.title+"' title='"+o.title+"' id='"+o.id+"' media-type='"+o.mimeType+"'/>";
	  				
 	  	}
 	  	manifest = manifest+"</manifest><spine toc='ncx'>";
 	  	for (s in spine){
 	  		
 	  		for (i=0;i<spine[s].length;i++){
			manifest=manifest+"<itemref idref='"+spine[s][i]+"'/>";
			} 	  		
 	  	}
 	  	manifest=manifest+"</spine>";
 	  	manifest=manifest+"</package>";
 	  	console.log(manifest);
 	  	
 	  	insertFile(parId, manifest, "text/xml", "package.opf", doneIt);
 	  	nav = "<?xml version='1.0' encoding='UTF-8'?> <html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'> <head> <title>Table of Contents</title> <meta charset='utf-8' /> </head> <body> <section class='frontmatter TableOfContents' epub:type='frontmatter toc'> <header> <h1>Table of Contents</h1> </header> <nav xmlns:epub='http://www.idpf.org/2007/ops' epub:type='toc' id='toc'><ol>"
 	  	for (c in xmlstrings){
 	  		nav=nav+"<li epub:type='Version' id='"+c+"'>"
 	  		nav=nav+"<span>"+c+"</span><ol>";
 	  		for (ch=0;ch<xmlstrings[c]["chapters"].length;ch++){
 	  			chap = xmlstrings[c]["chapters"][ch];
 	  			nav = nav+"<li id='"+chap.id+"'><a href='"+chap.href+"'>"+chap.title+"</a></li>";	
 	  		}
 	  		nav=nav+"</ol></li>"
 	  		
 	  	}
 	  	 	  nav =nav+"</ol></nav></section></body></html>";
 	  	 	  insertFile(parId, nav, "application/xhtml+xml", "nav.xhtml", doneIt);
 	  	 	  insertFolder(parId,"META-INF",function(resp){
 	  	 	  	console.log("META INF");
 	  	 	  	console.log(resp);
 	  	 	  	console.log(resp.id);
 	  	 	  	metainf="<?xml version='1.0'?><container version='1.0' xmlns='urn:oasis:names:tc:opendocument:xmlns:container'><rootfiles><rootfile full-path='package.opf' media-type='application/oebps-package+xml'/></rootfiles></container>";
 	  	 	  	insertFile(resp.id,metainf,"text/xml","container.xml",function(){
 	  	 	  	console.log("DONE IT ALL!");
 	  	 	  	userDownload(parId);
 	  	 	  	});});
 	  	 	  	
 	  	 	  
 	  }

 	  function userDownload(parId){
 	  	$("#finishRow").hide();
 	  	$("#downloadZipRow").show();
 	  $("#downloadLink").attr("href","https://drive.google.com/#folders/"+parId);
 	  $("#downloadLink").text($("#downloadLink").text()+parId);
 	  }
 	  function doneIt(){
 	  
 	  }
      function handleClientLoad() {
        // Step 2: Reference the API key
       
        gapi.client.setApiKey(apiKey);
        window.setTimeout(checkAuth,1);
      }

      function checkAuth() {
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
      }

      function handleAuthResult(authResult) {
        var authorizeButton = document.getElementById('signin');
        if (authResult && !authResult.error) {
          authorizeButton.style.visibility = 'hidden';
          //makeApiCall();
        } else {
          authorizeButton.style.visibility = '';
          authorizeButton.onclick = handleAuthClick;
        }
      }

      function handleAuthClick(event) {
        // Step 3: get authorization to use private data
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
        return false;
      }
      
      $(document).ready(function(){
      $("#syncVersions").click(function(){
      	$("#chapterLevel").hide();
      	$("#syncLevel").show();
      	   	$("#finishRow").hide();
      	$(".levelSelected").removeClass("levelSelected");
      });
      
      $("#selectChapters").click(function(){
      	 	$("#chapterLevel").show();
      	$("#syncLevel").hide();
         	$("#finishRow").hide();
      		$(".levelSelected").removeClass("levelSelected");
      			$("#selectChapters").addClass("levelSelected");
      });
     
     $("#finishUp").click(function(){
      	 	$("#chapterLevel").hide();
      	$("#syncLevel").hide();
      	$("#finishRow").show();
      		$(".levelSelected").removeClass("levelSelected");
      			$("#finishUp").addClass("levelSelected");
      }); 
    
     
     $("#loadSelected").click(function(){
     loadSelected();
     });
	  $("#SearchBox").change(function(){
	  	$("#introInstructions").hide();
	  	par = $(this).val();
	  	par = par.substring(par.lastIndexOf("/")+1);
	  	
	  	makeApiCall(par);
	  	 $("#addFileBox").show();
	  });
	    $("#treeGo").click(function(){
	  selectTagsFromPath($("#breakTag").val());
	  });
	  $("#testButton").click(function(){
	  getWorksheet(1);
	  });
	  $("#exportData").click(function(){
	  exportXML();
	  });
	  $("#doneButton").click(function(){
	  
	  finishing();
	  });
	  $("#saveData").click(function(){
	  exportXML();
	  	$("#chapterLevel").show();
      	$("#syncLevel").hide();
      
      		$(".levelSelected").removeClass("levelSelected");
      		$("#selectChapters").addClass("levelSelected");
      			
	  });
	  $("#tagSync").focus(function(){
	  });
	  
	  $("#SyncGo").click(function(){

   		  
   		  	syncFiles();
   		
   		  
	 
	  });
	  });
	  
	  
	  
	  
function selectTagsFromPath(path){
	makeChapters();
	for (x in xmlstrings){
		anXML = xmlstrings[x];
		cssPaths = $(anXML["dom"]).find(path);
		aPath=[];
		for(p=0;p<cssPaths.length;p++){		
			anode = cssPaths[p];
			if ((!($(anode).attr("id")))||($(anode).attr("id").length<1)){
	  	 		$(anode).attr("id",uuid());
			}
			aPath.push($(anode).prop("tagName")+"#"+$(anode).attr("id"));
			anode = $(anode).parent();
			while ($(anode).prop("tagName")!=undefined)	{
			   if ((!($(anode).attr("id")))||($(anode).attr("id").length<1)){
	  	 			$(anode).attr("id",uuid());
			    }
				aPath.push($(anode).prop("tagName")+"#"+$(anode).attr("id"));
				anode = $(anode).parent()
			}
			while (aPath.length>1){
				popNode = aPath.pop();
				pId = popNode.split("#")[1];
				openTag(x,pId,x+"___"+pId);
			}
			popNode=aPath.pop();
			pId = x+"___"+popNode.split("#")[1];
			$("#"+pId+">input.chapterSelect").prop("checked",true);		
		}
	}
}

function makeChapters(){
	heads = [];
	$("#trees").empty();
	$("#trees").append("<table id='treeTable'></table>");
	var i=0;
	for (x in xmlstrings){
		heads.push(x);
	 	if ($("#tree_"+x).length<1){
	 		if ((i%3)==0){
	 			row = $("<tr></tr>");
	 			$("#treeTable").append(row);
	 		}
	 		else
	 		{
	 			row = $("#treeTable").find("tr").last();
	 		}
	 		i++;
	 		$(row).append("<td><div class='jcItem' id='tree_"+x+"'></div></td>");
	  
	  		var mydom = xmlstrings[x]["dom"];
	 		root = $(mydom.documentElement).eq(0);
	 		rootid = uuid();
	  		root.attr("id",rootid);
	  		htmlBox= $("#tree_"+x);
	  		if ($("#"+x+"___"+rootid).length<1){
	  			rootTag = "<div><span class='treeLabel'>"+x+"</span><ul><li id='"+x+"___"+rootid+"'><span class='tagHead'>"+$(root).prop("tagName")+"</span></li></ul></div>";
	  			$(htmlBox).append(rootTag);
	  			var rootLabel = "#"+x+"___"+rootid;
				$(rootLabel).click(function(e){
					var HTMLrootid = $(e.target).attr("id");
					var rootparts = HTMLrootid.split("___");
					var xhead = rootparts[0];
					var rootid = rootparts[1];
					openTag(xhead,rootid,rootlabel);
	  			});
	  		}
	  	}
	  }
	
}
	  
//--------Open a branch of the tree-------
function openTag(head,xmlid,htmlid){

	    mydom = xmlstrings[head]["dom"];
		htmltag = $("#"+htmlid);
	    xmltag = $(mydom).find("#"+xmlid);
	  	kids = $(xmltag).children();
	  	
	  	taglist="";
	  	if ($(htmltag).find("ul").length<1){
	  	
	  	taglist = $("<ul></ul>");
	  	$(htmltag).append(taglist);
	  	}else{
	  	
	  	taglist =$(htmltag).find("ul").eq(0);
	  
	  	}
	
	 //else{ 	
	 
	  	for (k=0;k<kids.length;k++){
	  	
	  	    if ((!($(kids[k]).attr("id")))||($(kids[k]).attr("id").length<1)){
	  	   
	  	    $(kids[k]).attr("id",uuid());
	  	    }
	  	    tagId = $(kids[k]).attr("id");
	  	    tagName = $(kids[k]).prop("tagName");
	  	    
	  	    atts = "";
	  	    for (n=0;n<$(kids[k])[0].attributes.length;n++){
	  	    att=$(kids[k])[0].attributes[n];
	  	    
	  	    if (att.nodeName!="id"){
	  	    atts = atts+att.nodeName+":"+att.nodeValue+" ";
	  	    }
	  	    }
	  	    console.log(tagId);
	  	    if (tagName){
	  	    if ($("#"+head+"___"+tagId).length==0){
	  		newtag = $("<li id='"+head+"___"+tagId+"'><span class='tagHead'>"+tagName+" "+atts+"</span><input class='chapterSelect' type='checkbox'/><ul></ul></li>");
	  		$(taglist).append(newtag);
	  		var selectBox = $("#"+head+"___"+tagId).find("input.chapterSelect").eq(0);
	  		spanHead=$(newtag).find("span.tagHead").eq(0);
	  		console.log(tagName);

	  		$(selectBox).click(function(e){
	  			if ($(e.target).parent().children("ul").length>0){
	  			$(e.target).parent().children("ul").eq(0).empty();
	  			}
	  			/*if ($(e.target).prop("checked")){
	  			$(e.target).parent().addClass("chapterSelected");
	  			}
	  			else{
	  			$(e.target).parent().removeClass("chapterSelected");
	  			}*/
	  			tarpar = $(e.target).parent().parent();
	  			
	  			
	  		
	  			while ($(tarpar).prop("tagName")){
	  			console.log(tarpar);
	  				if ($(tarpar).children(".chapterSelect").length>0){
	  					$(tarpar).children(".chapterSelect").eq(0).prop("checked",false);
	  				}
	  				tarpar = $(tarpar).parent();
	  			}
	  		});
	  		
	  		$(spanHead).click(function(e){
	  			
	  			console.log("NOT YET!");
	  			var htmlid = $(e.target).parent().attr("id");
	  			var bigid = htmlid.split("___");
	  			
	  			var shortid = bigid[1];
	  			var head = bigid[0];
	  			
	  			mydom = xmlstrings[head]["dom"];
	  			
	  			xtag = $(mydom).find("#"+shortid).eq(0);
	  				taglist="";
	  		if ($(htmlid).find("ul").length<1){
	  	
	  			taglist = $("<ul></ul>");
	  			$("#"+htmlid).append(taglist);
	  			}else{
	  	
	  	taglist =$("#"+htmlid).find("ul").eq(0);
	  
	  	}

	  			if ($(e.target).parent().find("ul").children().length>0){
				$(e.target).parent().find("ul").eq(0).empty();
				}else{
	  			
	  			openTag(head,shortid,htmlid);
	  			}
	  			
	  		});
	  		}}
	  	
	  	}
	  //	}
	  }
	  

	      function addIds(){
	     cols = $(".column");
	      max = $(cols[1]).children().length;
	      for (x=2;x<cols.length;x++){
	      	if ($(cols[x]).children().length>max){
	      		max = $(cols[x]).children().length
	      	}
	      }
	      numbers = $("#numcols").find("div.cell");
	  
     		for (n=0;n<max;n++){
     			console.log(n);

     			for (x=1;x<cols.length;x++){
     				aCell = $(cols[x]).children().eq((n));
     				if (aCell){
     				
     				if (aCell.attr("id")){
     				aCellNum = parseInt(aCell.attr("id").substring(5));
     				head = $(cols[x]).children().eq(0).text();
     				//head = head.substring(0,head.lastIndexOf("."));
     				console.log(head);
     				$(xmlstrings[head]["tags"][aCellNum]).attr("id","anch_"+(n-1));
     				}
     				}
     			}
      		}
      		console.log(head);
      		for (head in xmlstrings){
      		var serializer = new XMLSerializer(); 
 xstring = serializer.serializeToString(xmlstrings[head]["dom"]);
xmlstrings[head]["string"]=xstring;
      	console.log(xstring);
      	}
      	}
      	
      	
      	function getTags(){
      	      	 selectedSync = $("#tagSync").val();

    if (selectedSync.length<1){
     selectedSync = "sp";
     }
   
      	for (x in xmlstrings){
      	
      	xmldoc = xmlstrings[x]["dom"];
      	  	
		 sps = $(xmldoc).find(selectedSync);
       $(sps).each(function(key){
     sp = sps[key];
		//txt = $(sp).text();
	
		 	xmlstrings[x]["tags"].push(sp);	
		
	});
		
	
 
  	}
      	}
      	
	      function getDocs(xml,title){
	  arrayresp = [];
	 shorttitle = title.substring(0,title.indexOf("."));
	
     xmldoc = $.parseXML(xml);
    // xmlstrings[shorttitle]={"string":xml,"dom":xmldoc};
    
     xmlstrings[shorttitle]={"string":xml,"dom":xmldoc,"tags":[],"chapters":[]};


  }
      
      function downloadFile(url,title){
      var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = function() {
      getDocs(xhr.responseText,title);
    };
    xhr.onerror = function() {
      alert(null);
    };
    xhr.send();
      }
      
	  function syncFiles(){
	  	getTags();
	  	$("#syncTableIntro").hide();
	  	$("#syncTableInstructions").show();
	  	$("#table").html("<div id='numcols' class='column'><div id='numHead' class='cell'>Num</div></div>");
	  	$("#table").show();
	  	
  	for (x in xmlstrings){
  
  		colval = xmlstrings[x]["tags"];
 	 	$("#table").append("<div class='column' id='col_"+x+"'><div class='cell'>"+x+"</div></div>");
 	 	thiscol = $("#col_"+x); 
 	 
 	 	i=0;
 	
 	 	
 	 	for (n=0;n<colval.length;n++){
 	 	
 			sp = colval[n];
 			
 	 		if (parseInt($("#numcols").children().size())<parseInt((i+2))){
 	 			
 	 			$("#numcols").append("<div class='cell' id='row_"+i+"'>"+i+"</div>");
 	 		}
 	 		//console.log(sp);
 	 		line = JSON.stringify($(sp).text());
  	  
  	  line = line.substring(1,line.length-1).replace(/\\n/g," ");
  	  line = line.replace(/\\\"/g,'"');
  	  line = line.replace(/\"\"/g,'"');
  	  line = line.replace(/\\/g,' ');
 	 		thiscol.append("<div class='cell' id='cell_"+n+"'>"+line+"</div>");
 	 		i=i+1
 	 	}
 	 	
 
 	 			 	
 	}

  	   $(".cell").click(function(){cellClick(this)});
  	   $(".cell").dblclick(function(){cellDoubleClick(this)});
  	   $("body").off("keypress");
 	$("body").keypress(function(e){
 		switch (e.which){
 			case 109:
 		// "m" pressed, move
 		    if ($(".moving").length>0){
 		    $(".moving").removeClass("moving");
 		    }
 		    else{
 			thisel = $(".selected").addClass("moving");
 			}
 			
 		break;
 		case 105:
 		// "i" pressed, insert
 		    
 			thisel = $(".selected");
 			if (thisel){
 				$(thisel).after("<div class='cell'></div>");
 			}
 			$(thisel).next().click(function(){cellClick(this)});
 			
 		break;
 		case 100:
 			thisel = $(".selected");
 			if (thisel){
 				if ($(thisel).text().length<1){
 					$(thisel).remove();
 				}
 				
 			}
 		break;
 		default:
 		yn = confirm("Do you wish to stop editing the table?");
 		if (yn){
 			exportXML();
 		}
 		break;
 		}
 	});
  	  
  	  }

	 

  // var request = gapi.client.drive.files.get({'fileId':xml[1].fileId});
        
function getFolderContents(tarpar,parName){
  gapi.client.load('drive', 'v2', function() {
         
           var request = gapi.client.drive.files.list({"q":"'"+tarpar +"' in parents and trashed=false"});
        
         
          request.execute(function(resp) {
          //  console.log(resp);
            items = resp.items;
			for (n in items){
				item = items[n];
				console.log(JSON.stringify(item));
				if (!(title==="EPUB")){
				otherFiles.push({"id":item.id, "title":title,"mimeType":item.mimeType,"path":"./"+parName+"/"});
				}
				}});
})
}

		function loadSelected(){
			xmls = $("#XMLFileList").find("li>input.xmlcheck:checked");
			for (i=0;i<xmls.length;i++){
				x = $(xmls[i]).attr("id").substring(4);
				if (xml[x].url) {
  					 downloadFile( xml[x].url,xml[x].title);
    			} else {
   				 alert(null);
 				 }

		
			}
			getExtXSL();
			getHeadXSL();	
			$("#addFileBox").hide();
			$("#actionMenu").show();
			if (xml.length>1){
			$("#syncLevel").show();
			$("#syncVersions").addClass("levelSelected");
			}
			else{
			$("#chapterLevel").show();
			$("#selectChapters").addClass("levelSelected");
			}
		}
      // Load the API and make an API call.  Display the results on the screen.
      function makeApiCall(tarpar) {
        // Step 4: Load the Google+ API
        gapi.client.load('drive', 'v2', function() {
          // Step 5: Assemble the API request
           var request = gapi.client.drive.files.list({"q":"'"+tarpar +"' in parents and trashed=false"});
        
          // Step 6: Execute the API request
          request.execute(function(resp) {
          //  console.log(resp);
            items = resp.items;
			for (n=0;n<items.length;n++){
				item = items[n];
				title = item.title;
				
				if (item.fileExtension =="xml"){
			
				xml[""+n]= {"title":title,"url":item.downloadUrl};
				$("#XMLFileList").append("<li><input id='xml_"+n+"' class='xmlcheck' type='checkbox' checked='true'></input> "+title+" </li>");
				}
				else if (item.fileExtension=="xsl"){
				xsl[""+n]={"title":title,"url":item.downloadUrl};
				$("#XSLFileList").append("<li><input id='xsl_"+n+"' class='xslcheck' type='checkbox'></input> "+title+" </li>");
				}
				else if ((item.mimeType=="application/vnd.google-apps.folder")&&(!(item.title==="EPUB"))){
					getFolderContents(item.id,item.title);
				}
				else {
				if (!(title==="EPUB")){
				otherFiles.push({"id":item.id,"title":title,"mimeType":item.mimeType,"path":"./"});
				}
				}
				
			}
			$(".xslcheck").click(function(e){
				$(".xslcheck").prop("checked",false);
				$(e.target).prop("checked",true);
			});
			$(".xslcheck").eq(0).prop("checked",true);
		//	loadAllXML();
            
          });
        });
      }
 
    
function insertFolder(tarpar,name,callback){

 var contentType = "application/vnd.google-apps.folder";
      const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";
    var metadata = {
      'title': name,
      'mimeType': contentType,
      'parents':[{"id":tarpar}]
    };
        var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        close_delim;
     var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart', 'convert':'true'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});

   
    request.execute(callback);

}



function insertFile(parFolder, data, contentType, title, callback) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";


   
    
    var metadata = {
      'title': title,
      'mimeType': contentType,
      'parents':[{"id":parFolder}]
    };

    var base64Data = btoa(data);
    
    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart', 'convert':'false'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});

   
    request.execute(callback,title);

  }


function getBatch(){


function insertFile(parFolder, data, contentType, title, callback) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";


   
    
    var metadata = {
      'title': title,
      'mimeType': contentType,
      'parents':[{"id":parFolder}]
    };

    var base64Data = btoa(data);
    
    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart', 'convert':'false'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});

   
    request.execute(callback);

  }
}


   
function cellClick(cell){

 moves = $(cell).parent().find(".moving");

 	if (moves.length>0){
 		for (m in moves){
 		    newcell = $(moves[m]).clone(true);
 			$(cell).after(newcell);
 			newcell.removeClass("moving");
 				newcell.removeClass("selected");
 			cell = newcell;
 			$(moves[m]).remove();
 		}
 	}

else{

selected = $(cell);
 //$(".selected").removeClass("selected");
 if (selected.hasClass("selected")){
 	$(cell).removeClass("selected");
 }else{
 		selected.addClass("selected");
 		
 }
 	
 	}
 	
 	
 		
 
 		
 }

 function exportXML(){
 	// Add IDs
 	
 	addIds();
 	$("#table").hide();
 	$("body").off("keypress");
 	// Split into chapters
 	
 	//makeChapters();
 	
 	// Transform chapters to HTML
 	// Create NAV files and other Epub pieces
 	// Push to folder and give download link
 	
 }
 