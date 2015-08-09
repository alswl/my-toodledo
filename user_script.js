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

var _selectedTask;

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

function triggerMouseEvent (node, eventType) {
    var clickEvent = document.createEvent ('MouseEvents');
    clickEvent.initEvent (eventType, true, true);
    node.dispatchEvent (clickEvent);
}

function initSelectedTaskDiv() {
    if (_selectedTask === undefined || !_selectedTask.is(':visible')) {
        _selectedTask = $j($j('.row')[0]);
    }
    _selectedTask.css({'background-color': '#e6e6e6'});
    return _selectedTask;
}

function moveUp() {
    var task = _selectedTask;
    $j(task).css({'background-color': ''});
    _selectedTask = $j(task).prev();
    _selectedTask.css({'background-color': '#e6e6e6'});
}

function moveDown() {
    var task = _selectedTask;
    $j(task).css({'background-color': ''});
    _selectedTask = $j(task).next();
    _selectedTask.css({'background-color': '#e6e6e6'});
}

function doneOrUndone() {
    var task = _selectedTask;
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
            var $row = _selectedTask;
            var id = $row.attr('id').replace('row', '');
            $row.find('#' + field + id).click();
        });
    });

    $j.each(SHORTCUT_FOCUS_DROPDOWN_FIELD, function(shortcut, option) {
        Mousetrap.bind('ctrl+' + shortcut, function() {
            var $row = _selectedTask;
            var id = $row.attr('id').replace('row', '');
            $row.find('#' + option.name + id).click();
            triggerMouseEvent($row.find('#' + option.select + id)[0], 'mousedown');   
        });
    });

    Mousetrap.bind('s', function() {
        var $row = _selectedTask;
        var id = $row.attr('id').replace('row', '');
        $j('#tig' + id).click();
    });

}



$j(document).ready(function() {

    Mousetrap.bind('0', function() {
        initSelectedTaskDiv();
        console.log(_selectedTask);
    });

    // move
    Mousetrap.bind('k', function() { initSelectedTaskDiv(); moveUp(); });
    Mousetrap.bind('j', function() { initSelectedTaskDiv(); moveDown(); });

    // action
    initTaskAction();
    Mousetrap.bind('x', function() { doneOrUndone(); });
    Mousetrap.bind('f', function() { dropdownFolder($j(_selectedTask)); });
    Mousetrap.bind('c', function() { dropdownContext($j(_selectedTask)); });

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

