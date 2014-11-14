(function () {

    var ScriptLoader = function () {
        var self = this;
        self.addScripts = function (scriptUrlList, callBack) {
            return $.when.apply($, $.map(scriptUrlList, function (s) {

                return self.addScript(s);
            })).done(function () {
                callBack();
            });
        };

        self.addScript = function (scriptUrl, callback) {
            return $.Deferred(function (dfd) {
                var head = document.head || jQuery("head")[0] || document.documentElement;
                var script = document.createElement("script");
                script.async = false;
                script.src = scriptUrl;
                script.onload = script.onreadystatechange = function (_, isAbort) {
                    if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                        script.onload = script.onreadystatechange = null;
                        //if (script.parentNode) {
                        //    script.parentNode.removeChild(script);
                        //}
                        script = null;

                        if (!isAbort) {

                            if (callback) callback(200, "success");
                            dfd.resolve(200, "success");
                        }
                    }
                };
                head.insertBefore(script, head.firstChild);
            });

        };
    };
    ScriptLoader.instance = new ScriptLoader();

    var makeDynamicAngular = function (angular) {
        var self = this;
        angular.omodule = angular.module;
        angular.obootstrap = angular.bootstrap;

        self.makeDynamic = function (app) {
            app.dynmaic = true;
            console.log('makeDynamic ' + app.name);

            app.config(function ($provide, $animateProvider, $filterProvider, $controllerProvider, $compileProvider, $injector) {
                console.log(app.name);

                var decorateFunc = function (obj, func, newFunc) {
                    var f = obj[func];
                    obj[func] = function () {
                        newFunc.apply(this, arguments);
                        f.apply(this, arguments);
                    };
                };

                decorateFunc(app, 'provider', function (name, provider_) {
                    $provide.provider(name, provider_);
                });

                decorateFunc(app, 'factory', function (name, factoryFn, enforce) {
                    $provide.factory(name, factoryFn, enforce);
                });
                decorateFunc(app, 'service', function (name, constructor) {
                    $provide.service(name, constructor);
                });
                decorateFunc(app, 'value', function (name, val) {
                    $provide.value(name, val);
                });
                decorateFunc(app, 'constant', function (name, value) {
                    $provide.constant(name, value);
                });
                decorateFunc(app, 'animation', function (name, factory) {
                    $animateProvider.register(name, factory);
                });
                decorateFunc(app, 'filter', function (name, factory) {
                    $filterProvider.register(name, factory);
                });
                decorateFunc(app, 'controller', function (name, constructor) {
                    $controllerProvider.register(name, constructor);
                });
                decorateFunc(app, 'directive', function (name, directiveFactory) {
                    $compileProvider.directive(name, directiveFactory);
                });

                app._dynamicConfigBlocks = [];
                app.config = function (configFn) {
                    console.log('config ' + app.name);

                    app._dynamicConfigBlocks.push(configFn);
                    return app;
                };
                app._dynamicRunBlocks = [];
                app.run = function (block) {
                    console.log('run ' + app.name);

                    app._dynamicRunBlocks.push(block);
                    return app;
                };
                app.reload = function () {
                    for (var i = 0; i < app._dynamicConfigBlocks.length; i++) {
                        $injector.invoke(app._dynamicConfigBlocks[i]);
                    };
                    for (var j = 0; j < app._dynamicRunBlocks.length; j++) {
                        $injector.invoke(app._dynamicRunBlocks[j]);
                    };
                };
                //myApp.reload = function () {
                //        var i, ii;
                //        for (i = 0, ii = myApp._invokeQueue.length; i < ii; i++) {
                //            var invokeArgs = myApp._invokeQueue[i];
                //            var provider = $injector.get(invokeArgs[0]);
                //            provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
                //        }
                //    };

                var loadedModules = [];
                app.LoadModuels = function (modulesToLoad) {
                    modulesToLoad = $(modulesToLoad).not(app.requires).get();
                    var runBlocks = [], moduleFn;
                    $.each(modulesToLoad, function (i, module) {
                        app.requires = app.requires.concat(module);
                        if ($.inArray(module, loadedModules) > -1) return;
                        loadedModules.push(module);
                        function runInvokeQueue(queue) {
                            var i, ii;
                            for (i = 0, ii = queue.length; i < ii; i++) {
                                var invokeArgs = queue[i],
                                    provider = $injector.get(invokeArgs[0]);

                                provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
                            }
                        }

                        try {
                            if (angular.isString(module)) {
                                moduleFn = angular.module(module);
                                runBlocks = runBlocks.concat(app.LoadModuels(moduleFn.requires)).concat(moduleFn._runBlocks);
                                runInvokeQueue(moduleFn._invokeQueue);
                                runInvokeQueue(moduleFn._configBlocks);
                            } else if (angular.isFunction(module)) {
                                runBlocks.push($injector.invoke(module));
                            } else if (angular.isArray(module)) {
                                runBlocks.push($injector.invoke(module));
                            } else {
                                //assertArgFn(module, 'module');
                            }
                        } catch (e) {
                            if (angular.isArray(module)) {
                                module = module[module.length - 1];
                            }
                            if (e.message && e.stack && e.stack.indexOf(e.message) == -1) {
                                e = e.message + '\n' + e.stack;
                            }
                            throw new Error('modulerr ' + "Failed to instantiate module " + module + "due to:\n " + (e.stack || e.message || e));
                        }
                    });
                    return runBlocks;
                };
                if (app.dynamicRequires && app.dynamicRequires.length > 0) {

                    app.LoadModuels(app.dynamicRequires);
                }

            });
            return app;
        };
        self.dmodule = function (name, requires, configFn) {
            var app = null;
            try {
                app = angular.omodule(name);
                if (requires && requires.length > 0) {

                    if (app.LoadModuels) {
                        app.LoadModuels(requires);
                    } else {
                        if (!app.dynamicRequires) {
                            app.dynamicRequires = [];
                        }
                        app.dynamicRequires = app.dynamicRequires.concat(requires);
                    }

                }
            } catch (e) {
                app = angular.omodule(name, requires || [], configFn);
            }
            return !('dynmaic' in app) ? self.makeDynamic(app) : app;
        };
        self.dbootstrap = function (element, modules, config) {
            var injector = angular.element($(element).closest('.ng-scope')).injector();
            if (!injector) {
                injector = angular.element($(element).find('.ng-scope')).injector();
            }
            if (injector) {
                var $compile = injector.get('$compile');
                var $rootScope = injector.get('$rootScope');
                var r = $compile($(element).get(0))($rootScope);
                $rootScope.$apply();
            } else {
                injector = angular.obootstrap($(element).get(0), modules, config);
            }
            return injector;
        };
        self.load = function (loadRequest) {

            var config = {
                url: null,
                scripts: null,
                modules: null,
                config: null,
                container: null,
                containerRoot: null,
                template: null
            };

            loadRequest = $.extend(config, loadRequest);

            return ScriptLoader.instance.addScripts(loadRequest.scripts, function () {

                function onResult(result) {
                    if (loadRequest.url || loadRequest.template) {
                        $(loadRequest.container).append(result);
                    }

                    ////angular.module('app1').reload();////
                    angular.bootstrap(loadRequest.containerRoot || loadRequest.container, loadRequest.modules, loadRequest.config);

                };

                if (loadRequest.url) {
                    $.ajax({
                        type: 'get',
                        url: loadRequest.url,
                        dataType: 'html'
                    }).done(function (result) {
                        onResult(result);
                    });
                } else {
                    onResult(loadRequest.template);
                }
            });

        };

        angular.module = self.dmodule;
        angular.bootstrap = self.dbootstrap;
        angular.load = self.load;
    };
    makeDynamicAngular(angular);


}());