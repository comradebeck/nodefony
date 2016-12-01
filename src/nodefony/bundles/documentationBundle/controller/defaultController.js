

nodefony.registerController("default", function(){

		/**
		 *	The class is a **`default` CONTROLLER** .
		 *	@module App
		 *	@main App
		 *	@class default
		 *	@constructor
		 *	@param {class} container   
		 *	@param {class} context
		 *	
		 */
		var defaultController = class defaultController extends nodefony.controller {
			constructor(container, context){
				super(container, context);
				this.kernel = this.get("kernel") ;
			};

			/**
		 	*
		 	*	@method indexAction
		 	*
		 	*/
			indexAction (version){
				if( ! version ){
					var defaultVersion = this.kernel.settings.system.version;
				}else{
					var defaultVersion = version ;
				}
				var url = this.generateUrl("documentation-version",{
					bundle:"nodefony",
					version:defaultVersion
				})
				return this.redirect(url);
			};

			subSectionAction (version, bundle, section){
				if (this.query.subsection){
					var subsection = this.query.subsection ;	
				}else{
					var subsection = section ;	
				}

				if ( ! bundle ) bundle = "nodefony" ;
				if (  bundle === "nodefony"){
					var path = this.kernel.nodefonyPath ;
				}else{
					if ( this.kernel.bundles[bundle] ){
						var path = this.kernel.bundles[bundle].path ;
					}else{
						var path = this.kernel.nodefonyPath ;
					}
				}
				try {
					if ( version ){
						if ( section ){
							var finder  = new nodefony.finder( {
								path:path+"/doc/"+version+"/"+section,
								depth:1
							});
						}else{
							var finder  = new nodefony.finder( {
								path:path+"/doc/"+version,
								depth:1
							});
						}
					}else{
						var finder  = new nodefony.finder( {
							path:path+"/doc/Default",
							depth:1
						});	
					}
				}catch(e){
					this.logger(e);
					throw e ;
				}
				var directory  = finder.result.getDirectories();
				var sections = [];
				directory.forEach(function(ele , index){
					sections.push(ele.name)
				})
				return this.render("documentationBundle:layouts:navSection.html.twig", {bundle:bundle, version:version, section:section,sections:sections,subsection:subsection});
			};

			versionAction (version, bundle, section){

				if (this.query.subsection){
					var subsection = this.query.subsection ;	
				}else{
					var subsection = "" ;	
				}

				if ( ! bundle ) bundle = "nodefony" ; 
				if ( bundle === "nodefony" ){
					var path = this.kernel.nodefonyPath ;
					var bundles = this.kernel.bundles ;
					if (! section ){
						var directoryBundles = [] ;
						for ( var myBundle in bundles ) {
							directoryBundles.push(bundles[myBundle]);
						}
					}

				}else{
					if ( this.kernel.bundles[bundle] ){
						var path = this.kernel.bundles[bundle].path
					}else{
						var path = this.kernel.nodefonyPath ;
					}
				}

				// get all version 
				var finderVersion  = new nodefony.finder( {
					path:path+"/doc",
					recurse:false,
				});
				var directory  = finderVersion.result.getDirectories();
				var all = [];
				directory.forEach(function(ele , index){
					all.push(ele.name)
				});

				// manage link 
				try {
					if ( version ){
						if ( section ){
							if ( subsection ){
								var findPath = path+"/doc/"+version+"/"+section+"/"+subsection ;
							}else{
								var findPath = path+"/doc/"+version+"/"+section ;
							}
							var finder  = new nodefony.finder( {
								path:findPath,
								recurse:false,
								followSymLink:true,
							});
						}else{
							var finder  = new nodefony.finder( {
								path:path+"/doc/"+version,
								recurse:false,
								followSymLink:true,
							});	
						}
					}else{
						var finder  = new nodefony.finder( {
							path:path+"/doc/Default",
							recurse:false,
							followSymLink:true,
						});
					}
				}catch(e){
					var finder  = new nodefony.finder( {
							path:path+"/doc/Default",
							recurse:false,
							followSymLink:true,
						});

				}
				var result = finder.result  ;

				if ( section ){
					var force = this.query.force ;
					if ( !  force ){
						//twig
						var file = result.getFile("index.html.twig" , true);
						if ( file ){
							var res = this.renderRawView(file,{bundle:bundle, readme:res, version:version, section:section, allVersions:all,subsection:subsection} ); 
							return this.render("documentationBundle::index.html.twig",{bundle:bundle, readme:res, version:version, section:section, allVersions:all,subsection:subsection});
						}
					}
					// MD
					var file = result.getFile("readme.md" , true )
					if (  ! file ){
						return this.render("documentationBundle::index.html.twig",{bundle:bundle, version:version, section:section, allVersions:all,subsection:subsection}); 
					}
					var res = this.htmlMdParser(file.content(file.encoding),{
						linkify: true,
						typographer: true	
					});
					return this.render("documentationBundle::index.html.twig",{bundle:bundle, readme:res, version:version, section:section, allVersions:all,subsection:subsection});
				}else{
					var force = this.query.force ;
					
					if ( !  force ){
						var file = result.getFile("index.html.twig" , true)
						if ( file ){
							var res = this.renderRawView(file, {bundle:bundle, readme:res, version:version, section:section, allVersions:all,subsection:subsection, bundles:directoryBundles }); 
							return this.render("documentationBundle::index.html.twig",{bundle:bundle, readme:res, version:version, section:section, allVersions:all,subsection:subsection,bundles:directoryBundles});
						}
					}

					var file = result.getFile("README.md" , true);

					if ( file ){
						var res = this.htmlMdParser(file.content(file.encoding),{
							linkify: true,
							typographer: true	
						});
						return this.render("documentationBundle::index.html.twig",{bundle:bundle, readme:res, version:version, section:section, allVersions:all,subsection:subsection});
					}else{
						return this.render("documentationBundle::index.html.twig",{bundle:bundle, readme:res, version:version, section:section, allVersions:all,subsection:subsection});
					}
				}


			};

			navDocAction (){
				
				var finder  = new nodefony.finder( {
					path:this.kernel.nodefonyPath+"/doc/",
					recurse:false,
				});

				var directory  = finder.result.getDirectories();
				//console.log(directory)

				var versions = [];
				directory.forEach(function(ele , index){
					versions.push(ele.name);
				})

				return this.renderView("documentationBundle::navDoc.html.twig",{
					versions : versions	
				})
			}

			navDocBundleAction (){
				
				var bundles = this.kernel.bundles ;

				var directory = [] ;
				for ( var bundle in bundles ) {
					directory.push(bundles[bundle]);
				}

				return this.renderView("documentationBundle::navDocBundle.html.twig",{
					versions : directory	
				})
			}

			/**
 	 	 	*
 	 	 	*	 footer
	 	 	*
 	 	 	*
 	 	 	*/
			footerAction (){
				var translateService = this.get("translation");
				var version =  this.kernel.settings.system.version ;
				var path = this.generateUrl("home");
				var year = new Date().getFullYear();
				var langs = translateService.getLangs();
				var locale = translateService.getLocale();
				var langOptions = "";
				for (var ele in langs ){
					if (locale === langs[ele].value){
						langOptions += '<option value="'+langs[ele].value+'" selected >'+langs[ele].name+'</option>' ;	
					}else{
						langOptions += '<option value="'+langs[ele].value+'" >'+langs[ele].name+'</option>';	
					}
				}
				var html = '<nav class="navbar navbar-default navbar-fixed-bottom" role="navigation">\
				   	<div class"container-fluid">\
				   	<div class="navbar-header">\
				   	<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#footer-collapse">\
				   	<span class="sr-only">Toggle navigation</span>\
				   	<span class="icon-bar"></span>\
				   	<span class="icon-bar"></span>\
				   	<span class="icon-bar"></span>\
				   	</button>\
				   	<a class=" text-primary navbar-text" href="'+path+'" style="margin-left:20px" >\
				   	'+year+'\
				   	<strong class="text-primary"> NODEFONY '+version+'  ©</strong> \
				   	</a>\
				   	</div>\
				   	<div class="collapse navbar-collapse" id="footer-collapse">\
				   	<ul class="nav navbar-nav navbar-left">\
				   	</ul>\
				   	<ul class="nav navbar-nav navbar-right">\
				   	<li  class="navbar-btn pull-right" style="margin-right:40px">\
				   	<select id="langs"  class="form-control">\
				   	'+langOptions+'\
				   	</select>\
				   	</li>\
				   	</div>\
				   	</div>\
				   	</div>\
				   	</div>'
			 	return this.getResponse(html);	
			}

			
			searchAction (){

				var url = this.generateUrl("documentation-version",{
					bundle:"nodefony",
					version:this.kernel.settings.system.version
				}, true)
				
				var request = this.getRequest();
				var context = this.getContext();
				//console.log(request.url.host)
				var query = request.query ;
				if (query.search ){
					var webCrawler = this.get("webCrawler");

					webCrawler.siteAll(url, query.search, context, (data) =>{
						this.renderJsonAsync(data);
					});
				}else{
					this.renderJsonAsync({});	
				}
			
			};
		};

		return defaultController;
});
