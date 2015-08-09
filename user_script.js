// ==UserScript==
// @name         My Toodledo
// @namespace    http://log4d.com/
// @version      0.1
// @description  upgrade toodledo
// @author       You
// @match        http://www.duitang.com/*
// @match        https://www.toodledo.com/tasks/*
// @match        https://www.baidu.com/*
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
    'p': 'pri', 
    'd': 'due'
};
var SHORTCUT_FOCUS_DROPDOWN_FIELD = {
    'f': {name: 'fol', 'select': 'lof'},
    'c': {name: 'con', 'select': 'noc'},
    's': {name: 'sta', 'select': 'tas'}
};

function highlightRow($row) {
    $row.css({'background-color': '#e6e6e6'});
}

function unhighlightRow($row) {
    $row.css({'background-color': ''});
}

function triggerMouseEvent (node, eventType) {
    var clickEvent = document.createEvent ('MouseEvents');
    clickEvent.initEvent (eventType, true, true);
    node.dispatchEvent (clickEvent);
}

function initSelectedTaskDiv() {
    if (_$selectedTask === undefined || !_$selectedTask.is(':visible')) {
        _$selectedTask = $j('.row').eq(0);
    }
    highlightRow(_$selectedTask);
    return _$selectedTask;
}

function moveUp() {
    var lastTask = _$selectedTask;
    var prevLevel1Row = _$selectedTask;
    //debugger
    if (lastTask.parents('.subtasks').length) {
        prevLevel1Row = lastTask.parents('.row');
    } else {
        prevLevel1Row = lastTask.prev('.row');
        if (!prevLevel1Row.length) {
            prevLevel1Row = lastTask.prev('.sep').prev('.row');
        }
    }
    if (lastTask.parents('.subtasks').length) {  // in sub list
        if (lastTask.prev('.row').length) {
            _$selectedTask = lastTask.prev('.row');
        } else if (prevLevel1Row.length){
            _$selectedTask = prevLevel1Row;
        }
    } else if (prevLevel1Row.length) { // prev row
        if (prevLevel1Row.find('.subtasks').length) { // focus prev row last
            _$selectedTask = prevLevel1Row.find('.subtasks .row').last('.row');
        } else {
            _$selectedTask = prevLevel1Row;
        }
    }
    unhighlightRow(lastTask);
    highlightRow(_$selectedTask);
}

function moveDown() {
    var lastTask = _$selectedTask;
    var nextLevel1Row = _$selectedTask;
    //debugger
    if (lastTask.parents('.subtasks').length) {
        nextLevel1Row = lastTask.parents('.row').next('.row');
        if (!nextLevel1Row.length) {
            nextLevel1Row = lastTask.parents('.row').next('.sep').next('.row');
        }
    } else {
        nextLevel1Row = lastTask.next('.row');
        if (!nextLevel1Row.length) {
            nextLevel1Row = lastTask.next('.sep').next('.row');
        }
    }
    if (lastTask.parents('.subtasks').length) { // in sub list
        if (lastTask.next('.row').length) {
            _$selectedTask = lastTask.next('.row');
        } else {
            if (nextLevel1Row.length) {
                _$selectedTask = nextLevel1Row;
            }
        }
    } else if (lastTask.find('.subtasks').length) { // go into sub list
        _$selectedTask = lastTask.find('.subtasks .row').first('.row');
    } else if (nextLevel1Row.length) { // next row
        _$selectedTask = nextLevel1Row;
    } 
    //if (lastTask.find('.subtasks').length) {
        //_$selectedTask = lastTask.find('.subtasks .row').first();
    //} else if (!lastTask.next('.row').length && lastTask.parents('.subtasks').length) {
        //_$selectedTask = lastTask.parents('.row').next('.row');
    //} else {
        //_$selectedTask = lastTask.next('.row');
    //}
    unhighlightRow(lastTask);
    highlightRow(_$selectedTask);
}

function doneOrUndone() {
    var task = _$selectedTask;
    //debugger
    var btn1 = $j(task).find('.ch > img');
    var btn2 = $j(task).find('.chd > img');
    btn1.click();
    btn2.click();
}

function gotoView(byWhat) {
    //debugger
    $j('.viewby[href="#' + byWhat + '"]').each(function(idx, elem) {
        elem.click();
    });
}

function initTaskAction() {
    $j.each(SHORTCUT_FOCUS_FIELD, function(shortcut, field) {
        Mousetrap.bind('ctrl+' + shortcut, function() {
            var $row = _$selectedTask;
            var id = $row.attr('id').replace('row', '');
            $row.find('#' + field + id).click();
        });
    });

    $j.each(SHORTCUT_FOCUS_DROPDOWN_FIELD, function(shortcut, option) {
        Mousetrap.bind('ctrl+' + shortcut, function() {
            var $row = _$selectedTask;
            var id = $row.attr('id').replace('row', '');
            $row.find('#' + option.name + id).click();
            triggerMouseEvent($row.find('#' + option.select + id)[0], 'mousedown');   
        });
    });

    Mousetrap.bind('s', function() {
        var $row = _$selectedTask;
        var id = $row.attr('id').replace('row', '');
        $j('#tig' + id).click();
    });

}



$j(document).ready(function() {

    Mousetrap.bind('0', function() {
        initSelectedTaskDiv();
        console.log(_$selectedTask);
    });

    // move
    Mousetrap.bind('k', function() { initSelectedTaskDiv(); moveUp(); });
    Mousetrap.bind('j', function() { initSelectedTaskDiv(); moveDown(); });

    // action
    initTaskAction();
    Mousetrap.bind('x', function() { doneOrUndone(); });
    Mousetrap.bind('f', function() { dropdownFolder($j(_$selectedTask)); });
    Mousetrap.bind('c', function() { dropdownContext($j(_$selectedTask)); });

    // navigate
    Mousetrap.bind('g c', function() { initSelectedTaskDiv(); gotoView('context'); });
    Mousetrap.bind('g f', function() { initSelectedTaskDiv(); gotoView('folder'); });
    Mousetrap.bind('g m', function() { initSelectedTaskDiv(); gotoView('Main'); });
    Mousetrap.bind('g s', function() { initSelectedTaskDiv(); gotoView('search'); });


    // --------------

    Mousetrap.bind("?", function() { console.log('show shortcuts!'); });
    Mousetrap.bind('esc', function() { console.log('escape'); }, 'keyup');

    // combinations
    Mousetrap.bind('command+shift+k', function() { console.log('command shift k'); });

    // map multiple combinations to the same callback
    Mousetrap.bind(['command+k', 'ctrl+k'], function() {
        console.log('command k or control k');

        // return false to prevent default browser behavior
        // and stop event from bubbling
        return false;
    });

    // gmail style sequences
    Mousetrap.bind('g i', function() { console.log('go to inbox'); });
    Mousetrap.bind('* a', function() { console.log('select all'); });

    // konami code!
    Mousetrap.bind('up up down down left right left right b a enter', function() {
        console.log('konami code');
    });
});

// vim: set ft=javascript expandtab sw=4:

