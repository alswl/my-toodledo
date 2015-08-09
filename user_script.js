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

function getSelectedTaskDiv() {
    if (_selectedTask === undefined) {
        _selectedTask = $j('.row')[0];
    }
    return _selectedTask;
}

function moveUp() {
    var task = getSelectedTaskDiv();
    $j(task).css({'background-color': ''});
    _selectedTask = $j(task).prev();
    _selectedTask.css({'background-color': '#e6e6e6'});
}

function moveDown() {
    var task = getSelectedTaskDiv();
    $j(task).css({'background-color': ''});
    _selectedTask = $j(task).next();
    _selectedTask.css({'background-color': '#e6e6e6'});
}

function doneOrUndone() {
    var task = getSelectedTaskDiv();
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

$j(document).ready(function() {
        
    Mousetrap.bind('0', function() { console.log(getSelectedTaskDiv()); });

	// single keys
	Mousetrap.bind('k', function() { moveUp(); });
  	Mousetrap.bind('j', function() { moveDown(); });
	Mousetrap.bind('x', function() { doneOrUndone(); });
  	Mousetrap.bind('g c', function() { gotoView('context'); });
  	Mousetrap.bind('g f', function() { gotoView('folder'); });
  	Mousetrap.bind('g m', function() { gotoView('Main'); });


  
    
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

// vim: set ft=javascript:
