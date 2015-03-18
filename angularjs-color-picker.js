/*!
 * angular-cakephp v0.3.0
 * https://github.com/ruhley/angular-color-picker/
 *
 * Copyright 2015 ruhley
 *
 * 2015-03-18 11:38:38
 *
 */
(function() {
    'use strict';

    angular.module('color.picker', []);
})();

(function() {
    'use strict';

    var colorPicker = function ($document, $timeout) {
        return {
            restrict: 'E',
            require: ['^ngModel'],
            scope: {
                ngModel: '=',
                colorPickerAlpha: '=',
                colorPickerCase: '=',
                colorPickerFormat: '=',
                colorPickerPos: '=',
                colorPickerSwatch: '=',
                colorPickerSwatchOnly: '=',
                colorPickerSwatchPos: '=',
            },
            templateUrl: 'template/color-picker/directive.html',
            link: function ($scope, element) {
                $scope.init = function () {
                    if ($scope.ngModel === undefined) {
                        $scope.hue = 0;
                        $scope.saturation = 0;
                        $scope.lightness = 100;
                    } else {
                        var color = tinycolor($scope.ngModel);

                        if (color.isValid()) {
                            var hsl = color.toHsl();
                            $scope.hue = hsl.h;
                            $scope.saturation = hsl.s * 100;
                            $scope.lightness = hsl.l * 100;
                        }
                    }
                    $scope.initConfig();

                    $document.on('click', function (evt) {
                        if ($scope.find(evt.target).length === 0) {
                            $scope.log('Color Picker: Document Hide Event');
                            $scope.hide();
                        }
                    });
                };

                $scope.initConfig = function() {
                    $scope.config = {};
                    $scope.config.alpha = $scope.colorPickerAlpha === undefined ? true : $scope.colorPickerAlpha;
                    $scope.config.case = $scope.colorPickerCase === undefined ? 'upper' : $scope.colorPickerCase;
                    $scope.config.format = $scope.colorPickerFormat === undefined ? 'hsl' : $scope.colorPickerFormat;
                    $scope.config.pos = $scope.colorPickerPos === undefined ? 'bottom left' : $scope.colorPickerPos;
                    $scope.config.swatch = $scope.colorPickerSwatch === undefined ? true : $scope.colorPickerSwatch;
                    $scope.config.swatchOnly = $scope.colorPickerSwatchOnly === undefined ? false : $scope.colorPickerSwatchOnly;
                    $scope.config.swatchPos = $scope.colorPickerSwatchPos === undefined ? 'left' : $scope.colorPickerSwatchPos;
                    $scope.log('Color Picker: Config', $scope.config);
                };

                $scope.focus = function () {
                    $scope.log('Color Picker: Focus Event');
                    $scope.find('.color-picker-input')[0].focus();
                };

                $scope.show = function () {
                    $scope.log('Color Picker: Show Event');
                    $scope.visible = true;
                    $scope.hueMouse = false;
                    $scope.opacityMouse = false;
                    $scope.colorMouse = false;
                };

                $scope.hide = function (apply) {
                    $scope.log('Color Picker: Hide Event');
                    $scope.visible = false;

                    if (apply !== false) {
                        $scope.$apply();
                    }
                };

                $scope.update = function () {
                    var color = tinycolor({h: $scope.hue, s: $scope.saturation, l: $scope.lightness}),
                        colorString;

                    if ($scope.config.alpha) {
                        color.setAlpha($scope.opacity / 100);
                    }

                    $scope.log('Color Picker: COLOR CHANGED TO ', color, $scope.hue, $scope.saturation, $scope.lightness, $scope.opacity);

                    $scope.swatchColor = color.toHslString();

                    switch ($scope.config.format) {
                        case 'rgb':
                            colorString = color.toRgbString();
                            break;

                        case 'hex':
                            colorString = color.toHexString();
                            if ($scope.config.case === 'lower') {
                                colorString = colorString.toLowerCase();
                            } else {
                                colorString = colorString.toUpperCase();
                            }
                            break;

                        case 'hsv':
                            colorString = color.toHsvString();
                            break;

                        default:
                            colorString = color.toHslString();
                            break;
                    }

                    $scope.ngModel = colorString;
                };

                $scope.$watch('ngModel', function (newValue, oldValue) {
                    if (newValue !== undefined && newValue !== oldValue) {
                        $scope.log('Color Picker: MODEL - CHANGED', newValue);
                        var color = tinycolor(newValue);

                        if (color.isValid()) {
                            var hsl = color.toHsl();

                            if (!$scope.isValid) {
                                $scope.show();

                                $timeout(function() {
                                    $scope.hue = hsl.h;
                                    $scope.saturation = hsl.s * 100;
                                    $scope.lightness = hsl.l * 100;

                                    if ($scope.config.alpha) {
                                        $scope.opacity = hsl.a * 100;
                                    }

                                    $scope.hide();
                                });
                            } else {
                                $scope.hue = hsl.h;
                                $scope.saturation = hsl.s * 100;
                                $scope.lightness = hsl.l * 100;

                                if ($scope.config.alpha) {
                                    $scope.opacity = hsl.a * 100;
                                }
                            }

                            $scope.isValid = true;
                        } else {
                            $scope.isValid = false;
                        }
                    }
                });

                $scope.$watch('colorPickerFormat', function (newValue, oldValue) {
                    if (newValue !== undefined && newValue !== oldValue) {
                        if (newValue === 'hex') {
                            $scope.colorPickerAlpha = false;
                        }

                        $scope.initConfig();
                        $scope.update();
                    }
                });

                $scope.$watchGroup(
                    ['colorPickerAlpha', 'colorPickerCase'],
                    function (newValue, oldValue) {
                        if (newValue !== undefined) {
                            $scope.initConfig();
                            $scope.update();
                        }
                    }
                );

                $scope.$watchGroup(
                    ['colorPickerSwatchPos', 'colorPickerSwatchOnly', 'colorPickerSwatch', 'colorPickerPos'],
                    function (newValue, oldValue) {
                        if (newValue !== undefined) {
                            $scope.initConfig();
                        }
                    }
                );

                //---------------------------
                // HUE
                //---------------------------
                $scope.hueDown = function () {
                    $scope.log('Color Picker: HUE - MOUSE DOWN');
                    $scope.hueMouse = true;
                };

                $scope.hueUp = function () {
                    $scope.log('Color Picker: HUE - MOUSE UP');
                    $scope.hueMouse = false;
                };

                $scope.hueChange = function (evt, forceRun) {
                    if ($scope.hueMouse || forceRun) {
                        $scope.log('Color Picker: HUE - MOUSE CHANGE');
                        var el = $scope.find('.color-picker-hue');
                        $scope.hue = (1 - ((evt.pageY - $scope.offset(el, 'top')) / el.prop('offsetHeight'))) * 360;
                    }
                };

                $scope.$watch('hue', function (newValue, oldValue) {
                    if (newValue !== undefined) {
                        $scope.log('Color Picker: HUE - CHANGED');
                        $scope.huePos = (1 - (newValue / 360)) * 100;
                        $scope.grid = tinycolor({h: newValue, s: 50, l: 50}).toHslString();
                        $scope.update();
                    }
                });

                //---------------------------
                // OPACITY
                //---------------------------
                $scope.opacityDown = function () {
                    $scope.log('Color Picker: OPACITY - MOUSE DOWN');
                    $scope.opacityMouse = true;
                };

                $scope.opacityUp = function () {
                    $scope.log('Color Picker: OPACITY - MOUSE UP');
                    $scope.opacityMouse = false;
                };

                $scope.opacityChange = function (evt, forceRun) {
                    if ($scope.opacityMouse || forceRun) {
                        $scope.log('Color Picker: OPACITY - MOUSE CHANGE');
                        var el = $scope.find('.color-picker-opacity');
                        $scope.opacity = (1 - ((evt.pageY - $scope.offset(el, 'top')) / el.prop('offsetHeight'))) * 100;
                    }
                };

                $scope.$watch('opacity', function (newValue, oldValue) {
                    if (newValue !== undefined) {
                        $scope.log('Color Picker: OPACITY - CHANGED');
                        $scope.opacityPos = (1 - (newValue / 100)) * 100;
                        $scope.update();
                    }
                });

                //---------------------------
                // COLOR
                //---------------------------
                $scope.colorDown = function () {
                    $scope.log('Color Picker: COLOR - MOUSE DOWN');
                    $scope.colorMouse = true;
                };

                $scope.colorUp = function () {
                    $scope.log('Color Picker: COLOR - MOUSE UP');
                    $scope.colorMouse = false;
                };

                $scope.colorChange = function (evt, forceRun) {
                    if ($scope.colorMouse || forceRun) {
                        $scope.log('Color Picker: COLOR - MOUSE CHANGE');
                        var el = $scope.find('.color-picker-grid-inner');
                        $scope.saturation = ((evt.pageX - $scope.offset(el, 'left')) / el.prop('offsetWidth')) * 100;
                        $scope.lightness = (1 - ((evt.pageY - $scope.offset(el, 'top')) / el.prop('offsetHeight'))) * 100;
                    }
                };

                $scope.$watch('saturation', function (newValue, oldValue) {
                    if (newValue !== undefined && newValue !== oldValue) {
                        $scope.log('Color Picker: SATURATION - CHANGED');
                        $scope.saturationPos = (newValue / 100) * 100;
                        $scope.update();
                    }
                });

                $scope.$watch('lightness', function (newValue, oldValue) {
                    if (newValue !== undefined && newValue !== oldValue) {
                        $scope.log('Color Picker: LIGHTNESS - CHANGED');
                        $scope.lightnessPos = (1 - (newValue / 100)) * 100;
                        $scope.update();
                    }
                });


                //---------------------------
                // HELPER FUNCTIONS
                //---------------------------
                $scope.log = function () {
                    //console.log.apply(console, arguments);
                };

                // taken and modified from jQuery's find
                $scope.find = function (selector) {
                    var context = $scope.wrapper ? $scope.wrapper[0] : element[0],
                        results = [],
                        nodeType;


                    // Same basic safeguard as Sizzle
                    if (!selector) {
                        return results;
                    }

                    if (typeof selector === 'string') {
                        // Early return if context is not an element or document
                        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
                            return [];
                        }

                        results = context.querySelectorAll(selector);

                    } else {
                        if ($scope.contains(context, selector)) {
                            results.push(selector);
                        }
                    }

                    return angular.element(results);
                };

                $scope.contains = function (a, b) {
                    if (b) {
                        while ((b = b.parentNode)) {
                            if (b === a) {
                                return true;
                            }
                        }
                    }

                    return false;
                };

                $scope.offset = function (el, type) {
                    var offset,
                        x = 0,
                        y = 0,
                        body = document.documentElement || document.body;

                    if (el.length === 0) {
                        return null;
                    }

                    x = el[0].getBoundingClientRect().left + (window.pageXOffset || body.scrollLeft);
                    y = el[0].getBoundingClientRect().top + (window.pageYOffset || body.scrollTop);

                    offset = {left: x, top:y};

                    if (type !== undefined) {
                        return offset[type];
                    }

                    return offset;
                };


                $scope.init();
            }
        };
    };

    colorPicker.$inject = ['$document', '$timeout'];

    angular.module('color.picker').directive('colorPicker', colorPicker);
})();

angular.module('color.picker').run(['$templateCache', function($templateCache) {
  $templateCache.put('template/color-picker/directive.html',
    '<div class="color-picker-wrapper" ng-class="{\'color-picker-swatch-only\': config.swatchOnly}">\n' +
    '   <input class="color-picker-input form-control" type="text" ng-model="ngModel" size="7" ng-focus="show()" ng-class="{\'color-picker-input-swatch\': config.swatch && !config.swatchOnly && config.swatchPos === \'left\'}">\n' +
    '   <span class="color-picker-swatch" ng-click="focus()" ng-show="config.swatch" ng-class="{\'color-picker-swatch-left\': config.swatchPos !== \'right\', \'color-picker-swatch-right\': config.swatchPos === \'right\'}">\n' +
    '       <span class="color-picker-swatch-color" style="background-color: {{swatchColor}};"></span>\n' +
    '   </span>\n' +
    '   <div class="color-picker-panel" ng-show="visible" ng-class="{\n' +
    '       \'color-picker-panel-top color-picker-panel-right\': config.pos === \'top right\',\n' +
    '       \'color-picker-panel-top color-picker-panel-left\': config.pos === \'top left\',\n' +
    '       \'color-picker-panel-bottom color-picker-panel-right\': config.pos === \'bottom right\',\n' +
    '       \'color-picker-panel-bottom color-picker-panel-left\': config.pos === \'bottom left\',\n' +
    '   }">\n' +
    '       <div class="color-picker-hue color-picker-sprite" ng-click="hueChange($event, true)" ng-mousemove="hueChange($event, false)" ng-mousedown="hueDown()" ng-mouseup="hueUp()">\n' +
    '           <div class="color-picker-slider" style="top: {{huePos}}%;"></div>\n' +
    '       </div>\n' +
    '       <div class="color-picker-opacity color-picker-sprite" ng-show="config.alpha" ng-click="opacityChange($event, true)" ng-mousemove="opacityChange($event, false)" ng-mousedown="opacityDown()" ng-mouseup="opacityUp()">\n' +
    '           <div class="color-picker-slider" style="top: {{opacityPos}}%;"></div>\n' +
    '           </div>\n' +
    '       <div class="color-picker-grid color-picker-sprite" style="background-color: {{grid}};" ng-click="colorChange($event, true)" ng-mousemove="colorChange($event, false)" ng-mousedown="colorDown()" ng-mouseup="colorUp()">\n' +
    '           <div class="color-picker-grid-inner"></div>\n' +
    '           <div class="color-picker-picker" style="top: {{lightnessPos}}%; left: {{saturationPos}}%;">\n' +
    '               <div></div>\n' +
    '           </div>\n' +
    '       </div>\n' +
    '   </div>\n' +
    '</div>' +
    '');
}]);
