require('metismenu');
require('jquery-slimscroll');

require('./waves');

let aaSettings = undefined;

function loadSettings() {
  const settingsStr = sessionStorage.getItem('agile-admin') || '{}';
  aaSettings = JSON.parse(settingsStr);
}

function saveSettings() {
  sessionStorage.setItem('agile-admin', JSON.stringify(aaSettings));
}

// load settings from sessionStorage
loadSettings();

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(window).on("load resize", function () {
    let topOffset = 60;
    const width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
    if (width < 768) {
        $('div.navbar-collapse').addClass('collapse');
        topOffset = 100; // 2-row-menu
    }
    else {
        $('div.navbar-collapse').removeClass('collapse');
    }
    let height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
    height = height - topOffset;
    if (height < 1) height = 1;
    if (height > topOffset) {
        $("#page-wrapper").css("min-height", (height) + "px");
    }
});
// This is for resize window
$(window).on("load resize", function () {
    const width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
    if (!aaSettings.isSidebarOpened || width < 1170) {
        $('body').addClass('content-wrapper');
        $(".open-close i").addClass('ti-menu');
        $(".open-close i").removeClass('ti-angle-left');
        $(".sidebar-nav, .slimScrollDiv").css("overflow-x", "visible").parent().css("overflow", "visible");
    }
    else {
        $('body').removeClass('content-wrapper');
        $(".open-close i").addClass('ti-angle-left');
        $(".open-close i").removeClass('ti-menu');
    }
});

$(document).ready(function () {
  $(function () {
      $(".preloader").fadeOut();
      $('#side-menu').metisMenu();
  });
  // Theme settings
  //Open-Close-right sidebar
  /*
  $(".right-side-toggle").click(function () {
      $(".right-sidebar").slideDown(50);
      $(".right-sidebar").toggleClass("shw-rside");
      // Fix header
      $(".fxhdr").click(function () {
          $("body").toggleClass("fix-header");
      });
      // Fix sidebar
      $(".fxsdr").click(function () {
          $("body").toggleClass("fix-sidebar");
      });
      // Service panel js
      if ($("body").hasClass("fix-header")) {
          $('.fxhdr').attr('checked', true);
      }
      else {
          $('.fxhdr').attr('checked', false);
      }
      if ($("body").hasClass("fix-sidebar")) {
          $('.fxsdr').attr('checked', true);
      }
      else {
          $('.fxsdr').attr('checked', false);
      }
  });
  */
  /*
   * comment out because 'a.active' breaks bootstrap tab -- 2018.03.10 Yuki Takei
   *
  $(function () {
    var url = window.location;
    var element = $('ul.nav a').filter(function () {
        return this.href == url || url.href.indexOf(this.href) == 0;
    }).addClass('active').parent().parent().addClass('in').parent();
    if (element.is('li')) {
        element.addClass('active');
    }
  });
  */
  // This is for click on open close button
  // Sidebar open close
  $(".open-close").on('click', function () {
      if ($("body").hasClass("content-wrapper")) {
          aaSettings.isSidebarOpened = true;
          saveSettings();
          $("body").trigger("resize");
          $(".sidebar-nav, .slimScrollDiv").css("overflow", "hidden").parent().css("overflow", "visible");
          $("body").removeClass("content-wrapper");
          $(".open-close i").addClass("ti-angle-left");
          $(".open-close i").removeClass("ti-menu");
          $(".logo span").show();
      }
      else {
          aaSettings.isSidebarOpened = false;
          saveSettings();
          $("body").trigger("resize");
          $(".sidebar-nav, .slimScrollDiv").css("overflow-x", "visible").parent().css("overflow", "visible");
          $("body").addClass("content-wrapper");
          $(".open-close i").addClass("ti-menu");
          $(".open-close i").removeClass("ti-angle-left");
          $(".logo span").hide();
      }
  });
  /*
  // Collapse Panels
  (function ($, window, document) {
      var panelSelector = '[data-perform="panel-collapse"]';
      $(panelSelector).each(function () {
          var $this = $(this)
              , parent = $this.closest('.panel')
              , wrapper = parent.find('.panel-wrapper')
              , collapseOpts = {
                  toggle: false
              };
          if (!wrapper.length) {
              wrapper = parent.children('.panel-heading').nextAll().wrapAll('<div/>').parent().addClass('panel-wrapper');
              collapseOpts = {};
          }
          wrapper.collapse(collapseOpts).on('hide.bs.collapse', function () {
              $this.children('i').removeClass('ti-minus').addClass('ti-plus');
          }).on('show.bs.collapse', function () {
              $this.children('i').removeClass('ti-plus').addClass('ti-minus');
          });
      });
      $(document).on('click', panelSelector, function (e) {
          e.preventDefault();
          var parent = $(this).closest('.panel');
          var wrapper = parent.find('.panel-wrapper');
          wrapper.collapse('toggle');
      });
  }(jQuery, window, document));
  // Remove Panels
  (function ($, window, document) {
      var panelSelector = '[data-perform="panel-dismiss"]';
      $(document).on('click', panelSelector, function (e) {
          e.preventDefault();
          var parent = $(this).closest('.panel');
          removeElement();

          function removeElement() {
              var col = parent.parent();
              parent.remove();
              col.filter(function () {
                  var el = $(this);
                  return (el.is('[class*="col-"]') && el.children('*').length === 0);
              }).remove();
          }
      });
  }(jQuery, window, document));
  */
  //tooltip
  $(function () {
          $('[data-toggle="tooltip"]').tooltip()
      })
      //Popover
  $(function () {
          $('[data-toggle="popover"]').popover()
      })
      // Task
  $(".list-task li label").click(function () {
      $(this).toggleClass("task-done");
  });
  $(".settings_box a").click(function () {
      $("ul.theme_color").toggleClass("theme_block");
  });
});
//Colepsible toggle
$(".collapseble").click(function () {
  $(".collapseblebox").fadeToggle(350);
});
// Sidebar
$('.slimscrollright').slimScroll({
  height: '100%'
  , position: 'right'
  , size: "5px"
  , color: '#dcdcdc'
, });
$('.slimscrollsidebar').slimScroll({
  height: '100%'
  , position: 'right'
  , size: "0px"
  , color: '#dcdcdc'
, });
$('.chat-list').slimScroll({
  height: '100%'
  , position: 'right'
  , size: "0px"
  , color: '#dcdcdc'
, });
// Resize all elements
$("body").trigger("resize");
// visited ul li
$('.visited li a').click(function (e) {
  $('.visited li').removeClass('active');
  var $parent = $(this).parent();
  if (!$parent.hasClass('active')) {
      $parent.addClass('active');
  }
  e.preventDefault();
});
// Login and recover password
$('#to-recover').click(function () {
  $("#loginform").slideUp();
  $("#recoverform").fadeIn();
});
// Update 1.5
// this is for close icon when navigation open in mobile view
$(".navbar-toggle").click(function () {
  $(".navbar-toggle i").toggleClass("ti-menu");
  $(".navbar-toggle i").addClass("ti-close");
});
// Update 1.6
