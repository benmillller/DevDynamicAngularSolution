DevDynamicAngularSolution
=========================
## Description
DevDynamicAngularSolution is an Extension to angularJS that allows extending angular modules on the fly. ie
it allows adding new services, directives, filters etc to a module that has already been bootstraped, and rebinds the module to the same DOM tree.
In addition, it adds utility functions that load html and scripts (usually with extra module elements) into the page. by using this angular extension you can defer loading parts of your application to future time.

## Installation :
```html
 <script src="Scripts/lib/jquery.js"></script>
 <script src="Scripts/lib/angular.js"></script>
 <script src="Scripts/lib/dynamicAngularJs.js"></script>
```
## Usage :

#### script1.js
```js
angular.module('common').controller('lma2Ctrl', function ($scope) {
    $scope.lma2 = 'aaa2';
});

angular.module('myApp', ['common']);
```

#### views/view1.html.js
```html
<div data-ng-controller="lma2ctrl">
    <h1>lmadd2</h1>
    {{lma2}}
</div>
```
#### index.html
```html
<div data-ng-controller="lma2ctrl">
   <!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title></title>
    <script src="Scripts/lib/jquery.js"></script>
    <script src="Scripts/lib/angular.js"></script>
    <script src="Scripts/lib/dynamicAngularJs.js"></script>
    <script type="text/javascript">
        angular.module('app1').controller('lmactrl', function ($scope) {
            $scope.lma = 'aaa';
        });

        $(function () {
            angular.bootstrap($('#div2').get(0), ['app1']);

            angular.load({
                container: '#div3', url: 'view/view1.html', scripts: ['app/script1.js'], modules: ['app1']
            });

        });
    </script>
</head>
<body>
    <div id="div1">
        <div id="div2">
            <div data-ng-controller="lmactrl">
                <h1>lmadd</h1>
                {{lma}}
            </div>
        </div>

        <div id="div3">
            
        </div>

    </div>
</body>
</html>
</div>
```

## License :

The MIT License (MIT)

Copyright (c) 2013-2014 Ben miller

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
