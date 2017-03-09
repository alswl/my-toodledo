// vim: set ft=javascript expandtab sw=2:
// ==UserScript==
// @name         My Toodledo
// @namespace    http://log4d.com/
// @version      160803.1158
// @description  upgrade toodledo
// @author       You
// @match        https://www.toodledo.com/tasks/*
// @require      https://dn-staticfile.qbox.me/underscore.js/1.7.0/underscore-min.js
// @require      https://dn-staticfile.qbox.me/jquery/1.11.1/jquery.min.js
// @require      https://dn-staticfile.qbox.me/mousetrap/1.4.6/mousetrap.min.js
// @grant        GM_addStyle
// ==/UserScript==

var $j = window.jQuery.noConflict();

var _$selectedTask;
var SHORTCUT_FOCUS_FIELD = {
  'n': 'addnote',
  't': 'tsk',
  'r': 'rep',
  'l': 'len',
  'i': 'tim', 
  'd': 'due',
  'p': 'par',
  'o': 'pri'
};
var SHORTCUT_ACTION_FIELD = {
  'S': addSubtask,
  'D': duplicateTask,
  'X': function(id) {deleteTask(null, id);}
}
var SHORTCUT_FOCUS_DROPDOWN_FIELD = {
  'f': {name: 'fol', 'select': 'lof'},
  'c': {name: 'con', 'select': 'noc'},
  's': {name: 'sat', 'select': 'tas'},
  'a': {name: 'gol', 'select': 'log'}
};
var SELECTOR_ROW = '.row';
var SELECTOR_SUBTASKS = '.subtasks';
var SELECTOR_TIMER_PREFIX = '#tig';
var STYLE_HIGHLIGHT_ROW = '3px solid #4d90f0';
var SELECTOR_TASKS = '#tasks';
var SELECTOR_COLLPSE = '#js_sb_toggle';
var SELECTOR_ADD_BTN = '#quickAdd';
var SELECTOR_SHOW_FILTER_BTN = '#action_showFilter';
var SELECTOR_SUBTASK_INLINE_BTN = '#subf0';
var SELECTOR_SUBTASK_HIDDEN = '#subf1';
var SELECTOR_SUBTASK_INDENDED = '#subf2';


function highlightRow($row) {
  $row.css({'border-left': STYLE_HIGHLIGHT_ROW});
}

function unhighlightRow($row) {
  $row.css({'border-left': ''});
}

/**
 * for dorpdown mouse click
 */
function triggerMouseEvent(node, eventType) {
  var clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, false, true);
  node.dispatchEvent(clickEvent);
  return false;
}

/**
 * focus current task
 * @returns {*}
 */
function initSelectedTaskDiv() {
  if (_$selectedTask === undefined || !_$selectedTask.is(':visible')) {
    _$selectedTask = $j(SELECTOR_ROW).eq(0);
  }
  highlightRow(_$selectedTask);
  return _$selectedTask;
}

function getRowPrev($row, limit) {
  if ($row.prev(SELECTOR_ROW).length) {
    return $row.prev(SELECTOR_ROW);
  }
  if ($row.prev('.sep').length) {
    return getRowPrev($row.prev('.sep'), limit - 1);
  }
  if ($row.prev('style').length) {
    return getRowPrev($row.prev('style'), limit - 1);
  }
  return [];
}

function moveUp() {
  var lastTask = _$selectedTask;
  var prevLevel1Row = _$selectedTask;
  //debugger
  if (lastTask.parents(SELECTOR_SUBTASKS).length) {
    prevLevel1Row = lastTask.parents(SELECTOR_ROW);
  } else {
    prevLevel1Row = lastTask.prev(SELECTOR_ROW);
    if (!prevLevel1Row.length) {
      prevLevel1Row = getRowPrev(lastTask, 10);
    }
  }
  if (lastTask.parents(SELECTOR_SUBTASKS).length) {  // in sub list
    if (lastTask.prev(SELECTOR_ROW).length) {
      _$selectedTask = lastTask.prev(SELECTOR_ROW);
    } else if (prevLevel1Row.length){
      _$selectedTask = prevLevel1Row;
    }
  } else if (prevLevel1Row.length) { // prev row
    if (prevLevel1Row.find(SELECTOR_SUBTASKS + '' + SELECTOR_ROW).length) { // focus prev row last
      _$selectedTask = prevLevel1Row.find(SELECTOR_SUBTASKS + ' ' + SELECTOR_ROW).last();
    } else {
      _$selectedTask = prevLevel1Row;
    }
  }
  unhighlightRow(lastTask);
  highlightRow(_$selectedTask);
  //debugger
  if (_$selectedTask.position().top < $j(SELECTOR_TASKS).position().top) {
    $j(SELECTOR_TASKS).animate({ scrollTop: $j(SELECTOR_TASKS).scrollTop() - $j(SELECTOR_TASKS).height() / 3 }, 100);
  }
}

function getRowNext($row, limit) {
  if ($row.next(SELECTOR_ROW).length) {
    return $row.next(SELECTOR_ROW);
  }
  if ($row.next('.sep').length) {
    return getRowNext($row.next('.sep'), limit - 1);
  }
  if ($row.next('style').length) {
    return getRowNext($row.next('style'), limit - 1);
  }
  return [];
}

function moveDown() {
  var lastTask = _$selectedTask;
  var nextLevel1Row = _$selectedTask;
  //debugger
  if (lastTask.parents(SELECTOR_SUBTASKS).length) {
    nextLevel1Row = lastTask.parents(SELECTOR_ROW).next(SELECTOR_ROW);
    if (!nextLevel1Row.length) {
      nextLevel1Row = getRowNext(lastTask.parents(SELECTOR_ROW), 10);
    }
  } else {
    nextLevel1Row = lastTask.next(SELECTOR_ROW);
    if (!nextLevel1Row.length) {
      nextLevel1Row = getRowNext(lastTask, 10);
    }
  }
  if (lastTask.parents(SELECTOR_SUBTASKS).length) { // in sub list
    if (lastTask.next(SELECTOR_ROW).length) {
      _$selectedTask = lastTask.next(SELECTOR_ROW);
    } else {
      if (nextLevel1Row.length) {
        _$selectedTask = nextLevel1Row;
      }
    }
  } else if (lastTask.find(SELECTOR_SUBTASKS + ' ' + SELECTOR_ROW).length) { // go into sub list
    _$selectedTask = lastTask.find(SELECTOR_SUBTASKS + ' ' + SELECTOR_ROW).first();
  } else if (nextLevel1Row.length) { // next row
    _$selectedTask = nextLevel1Row;
  } 
  unhighlightRow(lastTask);
  highlightRow(_$selectedTask);
  //debugger
  if (_$selectedTask.position().top + _$selectedTask.height() - $j(SELECTOR_TASKS).position().top >  $j(SELECTOR_TASKS).height()) {
    $j(SELECTOR_TASKS).animate({ scrollTop: $j(SELECTOR_TASKS).scrollTop() + $j(SELECTOR_TASKS).height() / 3 }, 100);
  }
}

function doneOrUndone() {
  var task = _$selectedTask;
  //debugger
  var btn1 = $j(task).find('.ch .tsk').eq(0);
  var btn2 = $j(task).find('.chd .tsk').eq(0);
  //if (btn1.parents(SELECTOR_SUBTASKS).length || btn2.parents(SELECTOR_SUBTASKS).length) {
  //return false;
  //}
  btn1.click();
  btn2.click();
  return false;
}

function gotoView(byWhat) {
  //debugger
  $j('.viewby[hash="' + byWhat + '"]').each(function(idx, elem) {
    elem.click();
  });
}

function bindTaskActionHandler() {
  $j.each(SHORTCUT_FOCUS_FIELD, function(shortcut, field) {
    Mousetrap.bind(shortcut, function() {
      //debugger;
      var $row = _$selectedTask;
      var id = $row.attr('id').replace('row', '');
      var input = _.first($row.find('#' + field + id))
      if (input !== null) {
        input.click();
      }
      return false;
    });
  });
  $j.each(SHORTCUT_ACTION_FIELD, function(shortcut, actionFun) {
    Mousetrap.bind(shortcut, function() {
      var $row = _$selectedTask;
      var id = $row.attr('id').replace('row', '');
      actionFun(id);
      return false;
    });
  });

  $j.each(SHORTCUT_FOCUS_DROPDOWN_FIELD, function(shortcut, option) {
    Mousetrap.bind(shortcut, function() {
      var $row = _$selectedTask;
      var id = $row.attr('id').replace('row', '');
      $row.find('#' + option.name + id).click();
      triggerMouseEvent($row.find('#' + option.select + id)[0], 'mousedown');   
      return false;
    });
  });

  Mousetrap.bind('enter', function() {
    var $row = _$selectedTask;
    var id = $row.attr('id').replace('row', '');
    $j(SELECTOR_TIMER_PREFIX + id).click();
    return false;
  });
  Mousetrap.bind('x', function() { doneOrUndone(); });
}

function bindTaskClickHandler() {
  $j(document).on('click', SELECTOR_ROW, function(e) {
    initSelectedTaskDiv();
    unhighlightRow(_$selectedTask);
    _$selectedTask = $j(this);
    highlightRow(_$selectedTask);
    e.stopPropagation();
  });
}


$j(document).ready(function() {
  bindTaskClickHandler();
  bindTaskActionHandler();

  // move
  Mousetrap.bind('k', function() { initSelectedTaskDiv(); moveUp(); });
  Mousetrap.bind('j', function() { initSelectedTaskDiv(); moveDown(); });

  // action
  //Mousetrap.bind('f', function() { dropdownFolder($j(_$selectedTask)); });
  //Mousetrap.bind('c', function() { dropdownContext($j(_$selectedTask)); });

  // navigate
  Mousetrap.bind('g c', function() { initSelectedTaskDiv(); gotoView('context'); });
  Mousetrap.bind('g f', function() { initSelectedTaskDiv(); gotoView('folder'); });
  Mousetrap.bind('g m', function() { initSelectedTaskDiv(); gotoView('Main'); });
  Mousetrap.bind('g s', function() { initSelectedTaskDiv(); gotoView('search'); });
  Mousetrap.bind('0', function() {
    $j(SELECTOR_COLLPSE).click();
  });
  Mousetrap.bind('shift+n', function() {
    $j(SELECTOR_ADD_BTN).focus();
  });

  // View - subtask
  Mousetrap.bind('v l', function() {
    $j(SELECTOR_SHOW_FILTER_BTN).click();
    $j(SELECTOR_SUBTASK_INLINE_BTN).click();
    //$j('#filterPop').attr('changed', '1');
    //$j('#filterPop').blur();
    $j(SELECTOR_SHOW_FILTER_BTN).click();
  });
  Mousetrap.bind('v h', function() {
    $j(SELECTOR_SHOW_FILTER_BTN).click();
    $j(SELECTOR_SUBTASK_HIDDEN).click();
    //$j('#filterPop').attr('changed', '1');
    //$j('#filterPop').blur();
    $j(SELECTOR_SHOW_FILTER_BTN).click();
  });
  Mousetrap.bind('v d', function() {
    $j(SELECTOR_SHOW_FILTER_BTN).click();
    $j(SELECTOR_SUBTASK_INDENDED).click();
    //$j('#filterPop').attr('changed', '1');
    //$j('#filterPop').blur();
    $j(SELECTOR_SHOW_FILTER_BTN).click();
  });
});

