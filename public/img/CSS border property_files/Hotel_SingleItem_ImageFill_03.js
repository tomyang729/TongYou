/**
 * @fileoverview Provides layout specific functionality for HTML5 layout.
 * This includes layout specific directives, that are responsible for
 * interaction with the user, alignment of the blocks and texts in them.
 * Also includes layout specification and initialization.
 */


/**
 * Utilities object with specific functionality for the layout.
 * @param {!angular.Object} angular AngularJS object.
 * @return {!Object.<function>} Available functions.
 */
var layout = (function(angular) {
  /**
   * Minimal aspect ratio to consider an image to be vertical.
   * @const {number}
   */
  var ASPECT_RATIO = 1.2;


  /**
   * Uniform text font size attributes.
   * @enum {string}
   */
  var Font = {
    FONT_SIZE: 'fontSize',
    MIN_FONT_SIZE: 'minfontsize',
    UNIFORM_FONT_SIZE_SELECTOR: '[uniform-text-size]'
  };


  /**
   * Maximum font sizes for the elements. Pixel units are used.
   * @enum {number}
   */
  var MaxFontSize = {
    PRODUCT_NAME: 18,
    SIZE_SUBTITLE: 16,
    SUBTITLE_VERTICAL_LAYOUT: 14
  };


  /**
   * Minimum font sizes for the elements. Pixel units are used.
   * @enum {number}
   */
  var MinFontSize = {
    PRODUCT_NAME: 11,
    SIZE_SUBTITLE: 10,
    SUBTITLE_VERTICAL_LAYOUT: 10
  };


  /**
   * Delay for the uniform font size directive and the initial font size.
   * @enum {number}
   * @private
   */
  var UniformFontSize_ = {
    DELAY: 400,
    SMALLEST_FONT_SIZE: 1000
  };


  var module = angular.module('custom', []);
  var loadedRes = {};

  window.onAdData = function(data, util) {
    var preloader = window.initPreloading(data);
    preloader.addCompletionListener(function() {
      loadedRes = preloader.getLoadedImages();
      utils.onAdData(data, util);
    });
    preloader.start();
  };


  /**
   * Controller for using data binding in layout.
   * @param {!angular.Scope} $scope AngularJS layout scope.
   * @param {!Object} dynamicData Dynamic data from DAB.
   * @param {!angular.$timeout} $timeout The Angular timeout service.
   */
  function LayoutController($scope, dynamicData, $timeout) {
    helpers.LayoutController($scope, dynamicData);

    var design = $scope.design;

    $scope.classes = getClasses($scope);

    $scope.stopAnimation = false;
    $scope.isThin = function(url) {
      var imageContainer = loadedRes[url];
      var img = imageContainer && imageContainer[0];
      return img && (img.width / img.height < ASPECT_RATIO);
    };

    angular.forEach($scope.products, function(product) {
      product.price = product.salePrice || product.price;
    });

    // LayoutHeight and LayoutTypes enums are provided from the file
    // common_scripts_v4.js.
    if (!($scope.frameHeight == LayoutHeight.VERTICALS &&
        dynamicData.google_width == 300)) {
      design.nameSize = Math.max(MinFontSize.PRODUCT_NAME, design.nameSize);
      design.nameSize = Math.min(MaxFontSize.PRODUCT_NAME, design.nameSize);

      if ($scope.layoutType !== LayoutTypes.VERTICAL) {
        design.subTitleSize = Math.max(MinFontSize.SIZE_SUBTITLE,
            design.subTitleSize);
        design.subTitleSize = Math.min(MaxFontSize.SIZE_SUBTITLE,
            design.subTitleSize);
      } else {
        design.subTitleSize = Math.max(MinFontSize.SUBTITLE_VERTICAL_LAYOUT,
            design.subTitleSize);
        design.subTitleSize = Math.min(MaxFontSize.SUBTITLE_VERTICAL_LAYOUT,
            design.subTitleSize);
      }
    }

    $timeout(function() {
      var info = angular.element(document.querySelector('.info-holder'));
      info.addClass('transition-ease info-final-transition');
      var actions = angular.element(document.querySelector('.actions'));
      actions.addClass('transition-ease bottom-final-transition');
      var logoHolder = angular.element(document.querySelector('.logo-holder'));
      logoHolder.addClass('transition-ease bottom-final-transition');
    }, 500);
  }


  /**
   * After dynamic text sizing, this makes item font sizes uniform based on the
   * smallest font size.
   * @return {!angular.Directive} Directive definition object.
   */
  module.directive('uniformTextSize', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      link: function() {
        $timeout(function() {
          var selector = Font.UNIFORM_FONT_SIZE_SELECTOR;
          var smallestFontSize = UniformFontSize_.SMALLEST_FONT_SIZE;
          // Find smallest font size.
          angular.forEach(getElementsList(selector), function(textFitElement) {
            var elementMinimumFontSize =
                textFitElement.getAttribute(Font.MIN_FONT_SIZE);
            var elementFontSize = parseInt(
                helpers.getStyleProperty(textFitElement, Font.FONT_SIZE));
            if (elementFontSize < elementMinimumFontSize) {
              elementFontSize = elementMinimumFontSize;
            }
            if (elementFontSize < smallestFontSize) {
              smallestFontSize = elementFontSize;
            }
          });

          // Make uniform.
          angular.forEach(getElementsList(selector), function(listElement) {
            var ngSpan = angular.element(listElement.querySelector('span'));
            angular.element(listElement)
                .css(Font.FONT_SIZE, smallestFontSize + 'px');
            ngSpan.css(Font.FONT_SIZE, smallestFontSize + 'px');
          });
        }, UniformFontSize_.DELAY);
      }
    };
  }]);


  /**
   * Convenience alias for querySelectorAll that returns results as Array
   * (instead of querySelectorAll's native nodeList.)
   * @param {string} selector A CSS-style selector. ex: "#foo .bar>img"
   * @param {Element=} opt_element Root element to query (document is default).
   * @return {Array.<Element>}
   */
  function getElementsList(selector, opt_element) {
    if (!opt_element) {
      opt_element = document;
    }
    return Array.prototype.slice.call(opt_element.querySelectorAll(selector));
  }


  /**
   * Creates the list of the CSS classes to apply to the layout content
   * depending on parameters from DAB.
   * @param {!angular.Scope} scope AngularJS layout scope.
   * @return {!Object.<string>} All available CSS classes.
   */
  function getClasses(scope) {
    var design = scope.design;
    var layout = [design['cornerStyle']];
    var btn = [design['btnStyle']];

    if (!scope.toBoolean(design['btnShad'])) {
      btn.push('noShad');
    }

    return {
      layout: layout.join(' '),
      button: btn.join(' ')
    };
  }

  angular.module('layout', ['utils', module.name],
      function($controllerProvider) {
        $controllerProvider.allowGlobals();
  });

  return {
    controller: LayoutController
  };
})(angular);

(function() {
  // Hotel vertical
  utils.defineMeta('version', '2.0');

  // REQUIRED
  utils.defineAttribute('Headline', 'productClickOnly', true);
  utils.defineAttribute('Product', 'description', true);
  utils.defineAttribute('Product', 'name', true);
  utils.defineAttribute('Product', 'price', true);
  utils.defineAttribute('Product', 'url', true);
  utils.defineAttribute('Product', 'imageUrl', true);

  // OPTIONAL
  utils.defineAttribute('Design', 'logoImageUrl', false);
  utils.defineAttribute('Design', 'borderColor', false);
  utils.defineAttribute('Design', 'bgColor', false);
  utils.defineAttribute('Design', 'bgColorAlt', false);
  utils.defineAttribute('Design', 'btnColor', false);
  utils.defineAttribute('Design', 'txtColorPrice', false);
  utils.defineAttribute('Design', 'txtColorProduct', false);
  utils.defineAttribute('Design', 'txtColorCta', false);
  utils.defineAttribute('Design', 'txtColorPricePrefix', false);
  utils.defineAttribute('Design', 'txtColorSubTitle', false);
  utils.defineAttribute('Design', 'txtColorDisc', false);
  utils.defineAttribute('Design', 'cornerStyle', false);
  utils.defineAttribute('Design', 'btnStyle', false);
  utils.defineAttribute('Design', 'btnShad', false);
  utils.defineAttribute('Headline', 'showPrice', false);
  utils.defineAttribute('Headline', 'cta', false);
  utils.defineAttribute('Headline', 'pricePrefix', false);
  utils.defineAttribute('Headline', 'priceSuffix', false);
  utils.defineAttribute('Headline', 'disclaimer', false);
  utils.defineAttribute('Product', 'subTitle', false);
  utils.defineAttribute('Design', 'subTitleSize', false);

  // OCCURRENCES
  utils.defineOccurrences('Headline', 1, 1);
  utils.defineOccurrences('Design', 1, 1);
  utils.defineOccurrences('Product', 1, 1);

  window.setup = function() {
    document.getElementById('ad-container').addEventListener('click',
        utils.clickHandler, false);
  };

  window.initPreloading = function(dynamicData) {
    var data = dynamicData.google_template_data.adData[0];
    var design = utils.parse(data, 'Design')[0];
    var prods = utils.parse(data, 'Product').slice(0);
    var preloader = utils.preloader;
    for (var i = 0; i < prods.length; i++) {
      preloader.addImage(prods[i].imageUrl);
    }
    preloader.addImage(design.logoImageUrl);
    preloader.addImage(design.bgImageUrl);
    return preloader;
  };
})();
