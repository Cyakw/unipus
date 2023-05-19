// ==UserScript==
// @name         Unipus刷时长
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  支持自动跳过非必修章节
// @author       Superyi
// @
// @match        https://ucontent.unipus.cn/_pc_default/pc.html?cid=*
// @grant        none
// @license      GPL-3.0
// @compatible   chrome
// ==/UserScript==

(function() {
    'use strict';

    // 时间设置
    var minTime = [3, 30]; // 最短停留时间，默认是3分30秒
    var maxTime = [5, 30]; // 最大停留时间，默认为5分30秒
    var maxTestTime = [8, 30]; // 单元测试最短停留时间，默认是8分30秒
    var minTestTime = [10, 30]; // 单元测试最大停留时间，默认为10分30秒
    var autojump = 1; // 是否开启自动跳过非必修章节功能，0为关闭，1为开启
    var jumpTimeOut = 1; // 是否开启自动跳过已过截止时间的必修章节
    var unitTestStay = 1; // 是否单独设置单元测试的时间

    // 自动跳转到下一节
    function jumpToNextSection() {
        switchNext('.layoutHeaderStyle--circleTabsBox-jQdMo a', 'selected');
        switchNext('#header .TabsBox li', 'active');
        switchNext('#sidemenu li.group', 'active');
    }

    // 切换到下一个元素
    function switchNext(selector, classFlag) {
        var flag = false;
        var units = document.querySelectorAll(selector);
        for (var i = 0; i < units.length; i++) {
            var unit = units[i];
            if (flag) {
                unit.click();
                setTimeout(function() {
                    location.reload();
                }, 1000);
                flag = false;
                break;
            }
            if (unit.classList.contains(classFlag)) {
                flag = true;
            }
        }
    }

    // 自动点击弹窗
    function autoClickDialog() {
        var closeButton = document.getElementsByClassName('dialog-header-pc--close-yD7oN')[0];
        var confirmButton = document.querySelector('div.dialog-header-pc--dialog-header-2qsXD').parentElement.querySelector('button');
        if (closeButton) closeButton.click();
        if (confirmButton) confirmButton.click();
    }

    // 等待函数
    function wait(time) {
        return new Promise(function(resolve) {
            setTimeout(resolve, time);
        });
    }

    // 计算实际停留时间
    function calculateTime(minMinutes, minSeconds, maxMinutes, maxSeconds) {
        var rate = Math.random();
        return (minMinutes * 60 + minSeconds + ((maxMinutes - minMinutes) * 60 + maxSeconds - minSeconds) * rate) * 1000;
    }

    // 主逻辑
    function main() {
        // 自动跳过非必修章节
        if (autojump === 1) {
            wait(3000).then(function() {
                var feibixiu = document.getElementsByClassName('taskTipStyle--disrequired-1ZUIG');
                var bixiu = document.getElementsByClassName('taskTipStyle--required-23n0J');
                if (feibixiu[0].innerText === '非必修') {
                    jumpToNextSection();
                } else if (bixiu[0].innerText === '必修') {
                    return;
                }
            });
        }

        // 自动跳过已过截止时间的必修章节
        wait(3000).then(function() {
            try {
                var isTestTimeOut = document.getElementsByClassName('taskTipStyle--warningheadertext-1ch9A');
                if (isTestTimeOut[0].innerText === '学习截止时间已过，你可以继续学习，但本次提交得分不计入学习成绩' && jumpTimeOut === 1) {
                    jumpToNextSection();
                }
            } catch (error) {
                return;
            }
        });

        // 单元测试跳转
        wait(4000).then(function() {
            try {
                var unitTest = document.getElementsByClassName('utButtonStyle--toDoButton-1S89L');
                if (unitTestStay === 1 && unitTest[0].innerText === '开始做题') {
                    wait(calculateTime(minTestTime[0], minTestTime[1], maxTestTime[0], maxTestTime[1])).then(function() {
                        jumpToNextSection();
                    });
                }
            } catch (error) {
                wait(calculateTime(minTime[0], minTime[1], maxTime[0], maxTime[1])).then(function() {
                    jumpToNextSection();
                });
            }
            wait(calculateTime(minTime[0], minTime[1], maxTime[0], maxTime[1])).then(function() {
                jumpToNextSection();
            });
        });

        // 自动点击弹窗
        wait(3000).then(function() {
            autoClickDialog();
        });
    }

    // 执行主逻辑
    main();

})();
