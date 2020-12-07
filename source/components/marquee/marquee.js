/* global Metro */
/* eslint-disable */
(function(Metro, $) {
    'use strict';

    var MarqueeDefaultConfig = {
        items: null,
        backgroundColor: "#fff",
        color: "#000",
        borderSize: 0,
        borderColor: "transparent",
        loop: true,
        height: 100,
        width: "auto",
        speed: 3000,
        direction: "left",
        ease: "linear",
        mode: "default", // default || accent
        stopOnHover: true,

        clsMarquee: "",
        clsMarqueeItem: "",

        onMarqueeCreate: Metro.noop
    };

    Metro.marqueeSetup = function (options) {
        MarqueeDefaultConfig = $.extend({}, MarqueeDefaultConfig, options);
    };

    if (typeof window["metroMarqueeSetup"] !== undefined) {
        Metro.marqueeSetup(window["metroMarqueeSetup"]);
    }

    Metro.Component('marquee', {
        init: function( options, elem ) {
            this._super(elem, options, MarqueeDefaultConfig, {
                // define instance vars here
                items: [],
                running: false,
                current: -1
            });
            return this;
        },

        _create: function(){
            var that = this, element = this.element, o = this.options;

            this._createStructure();
            this._createEvents();

            this._fireEvent('marquee-create');
        },

        _createStructure: function(){
            var that = this, element = this.element, o = this.options;
            var dir = o.direction.toLowerCase(), items, Utils = Metro.utils;

            element.addClass("marquee").addClass(o.clsMarquee);

            element.css({
                height: o.height,
                width: o.width,
                backgroundColor: Metro.colors.isColor(o.backgroundColor) ? o.backgroundColor : MarqueeDefaultConfig.backgroundColor,
                color: Metro.colors.isColor(o.color) ? o.color : MarqueeDefaultConfig.color,
                borderStyle: "solid",
                borderWidth: o.borderSize,
                borderColor: Metro.colors.isColor(o.borderColor) ? o.borderColor : MarqueeDefaultConfig.borderColor
            });

            if (o.items) {
                items = Utils.isObject(o.items);
                if (items !== false) {
                    $.each(items, function(){
                        var el = $(this);

                        if (el.length)
                            el.appendTo(element);
                        else
                            element.append( $("<div>").html(this) );
                    })
                }
            }

            this.items = element.children("*").addClass("marquee__item").addClass(o.clsMarqueeItem).items();

            if (dir === "left" || dir === "right") {
                $(this.items).addClass("moveLeftRight");
            } else {
                $(this.items).addClass("moveUpDown");
            }

            if (this.items.length) {
                this.current = 0;
            }

            if (this.items.length) this.start();
        },

        _createEvents: function(){
            var that = this, element = this.element, o = this.options;

            element.on(Metro.events.enter, function(){
                if (o.stopOnHover)
                    $.pauseAll(that.items);
            })

            element.on(Metro.events.leave, function(){
                if (o.stopOnHover)
                    $.resumeAll(that.items);
            })
        },

        start: function(){
            var that = this, element = this.element, o = this.options;
            var chain = [], dir = o.direction.toLowerCase(), mode = o.mode.toLowerCase();
            var magic = 20;
            var ease = o.ease.toArray(",");

            if (mode === "default") {
                $.each(this.items, function (i) {
                    var draw;

                    if (["left", "right"].indexOf(dir) > -1) {
                        draw = {
                            left: dir === "left" ? [element.width(), -$(this).width() - magic] : [-$(this).width() - magic, element.width()]
                        }
                    } else {
                        draw = {
                            top: dir === "up" ? [element.height(), -$(this).height() - magic] : [-$(this).height() - magic, element.height()]
                        }
                    }

                    chain.push({
                        el: this,
                        draw: draw,
                        dur: +$(this).attr("data-speed") || o.speed,
                        ease: "linear",
                        defer: i === 0 ? 1000 : 0
                    });
                });
            } else {
                $.each(this.items, function(i){
                    var half, draw1, draw2;

                    if (["left", "right"].indexOf(dir) > -1) {
                        half = element.width() / 2 - $(this).width() / 2;
                        draw1 = {
                            left: dir === "left" ? [element.width(), half] : [-$(this).width() - magic, half]
                        }
                        draw2 = {
                            left: dir === "left" ? [half, -$(this).width() - magic] : [half, element.width() + magic]
                        }
                    } else {
                        half = element.height() / 2 - $(this).height() / 2;
                        draw1 = {
                            top: dir === "up" ? [element.height(), half] : [-$(this).height() - magic, half]
                        }
                        draw2 = {
                            top: dir === "up" ? [half, -$(this).height() - magic] : [half, element.height() + magic]
                        }
                    }

                    chain.push({
                        el: this,
                        draw: draw1,
                        dur: (+$(this).attr("data-speed") || o.speed) / 2,
                        ease: ease[0] || "linear",
                        defer: i === 0 ? 1000 : 0
                    });
                    chain.push({
                        el: this,
                        draw: draw2,
                        dur: (+$(this).attr("data-speed") || o.speed) / 2,
                        ease: ease[1] ? ease[1] : ease[0] ? ease[0] : "linear",
                        defer: 2000
                    });
                });
            }

            this.running = true;

            $.chain(chain, o.loop);
        },

        stop: function(){
            this.running = false;
            $.stopAll(this.items);
        },

        changeAttribute: function(attr, newValue){
        },

        destroy: function(){
            this.element.remove();
        }
    });
}(Metro, m4q));
/* eslint-enable */