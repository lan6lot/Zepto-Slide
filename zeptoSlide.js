/**
 * ZeptoSlide for mobile
 * k@kenny.cc
 */
;(function($,win){

    'use strict';

    $.fn.slide = function(option){
        if(!$.isPlainObject(option))option={};
        return new Slider(option,this)
    }

    function Slider(option,el){
        
        $.extend(this,{
            target : el,
            translateDuration : option.translateDuration || 500,
            autoPlay : option.autoPlay || true,
            autoPlayDuration : option.autoPlayDuration || 8000
        })

        this.init();
        
    }

    Slider.prototype.constructor = Slider;

    Slider.prototype.init = function(){
        var me    = this,
            width = me.WIDTH = me.target.width(),
            items = me.items = me.target.children(),
            wrap = document.createElement('div');

        this.wrap = $(wrap);
        this.offset = 0;
        this.index = 0;

        items.wrapAll(wrap);

        items.each(function(index,item){
            $(item).css({
                position : 'absolute',
                    left : width * index,
                     top : 0
            })
        })

        me.target.on({
            touchstart:$.proxy(touchStartHandler,me),
            touchmove:$.proxy(touchMoveHandler,me),
            touchend:$.proxy(touchEndHandler,me)
        })
        me.target.on('webkitTransitionEnd', function(){
            if(me.autoPlay && me.timer === null){
                me._autoPlay();
            }
        })
        me.autoPlay && me._autoPlay();
    }

    Slider.prototype.goDirection = function(direction,time){
        this.offset -= this.WIDTH*direction;
        this.index = (this.index + parseInt(direction))%this.items.length;

        if(this.index<0){
            this.index+=this.items.length;
        }

        var _time = this.translateDuration;
        if(time && time <= this.translateDuration){
            _time = time;
        }
        translate(this.wrap,_time,this.offset);

    }

    Slider.prototype._preload = function(direction){
        var index = (this.index + direction) % this.items.length;

        if(index < 0){
            index+=this.items.length;
        }
        this.items.eq(index).css('left',this.WIDTH*direction-this.offset+'px')
    }

    Slider.prototype._autoPlay = function(){
        var me = this;
        me.timer && clearTimeout(me.timer);

        me.timer = setTimeout(function play(){
            me._preload(1);
            me.goDirection(1);
            me.timer = setTimeout(play,me.autoPlayDuration);
        }, me.autoPlayDuration);
    }

    function touchStartHandler(e){
        var position = this.start = getPosition(e.touches[0]);
        
        // this.lock = false;
        // this.unlock = false;

        this.startTime = Date.now();
    }

    var lastMove = {};

    function touchMoveHandler(e){
        // if(this.lock)return;

        this.timer && clearTimeout(this.timer);
        this.timer = null;

        var move = this.move = getPosition(e.touches[0]),
            start = this.start;

        // if(lastMove.hasOwnProperty('x') && lastMove.hasOwnProperty('y')){
        //     if(Math.abs(move.x-lastMove.x) < Math.abs(move.y-lastMove.y)){
        //         if(!this.unlock){
        //             this.lock = true;
        //             return;
        //         }
        //     }else{
        //         this.unlock = true;
        //     }
        // }

        stopBubble(e);
        e.preventDefault();
        lastMove = move;
        
        var _offset = move.x - start.x,
            direction = _offset < 0 ? 1 : -1;
        
        this._preload(direction);
        translate(this.wrap,0,this.offset+_offset);
    }

    function touchEndHandler(e){
        // if(this.lock)return;
        var offset = this.move.x-this.start.x,
            changePage = ((this.WIDTH-Math.abs(offset))/this.WIDTH <= 0.5),
            time = Date.now() - this.startTime,
            direction = offset > 0 ? '-1' : '1';

        if(time<=200 && Math.abs(offset) >= 50 || changePage){
            this.goDirection(direction,time);
        }else{
            this.goDirection('0',time);
        }
    }

    function translate(el,t,x){
        el.css({
            '-webkit-transition':'all '+t+'ms ease 0',
            '-webkit-transform':'translate('+x+'px)'
        })
    }

    function getPosition(position){
        return {
            x : position.pageX,
            y : position.pageY
        }
    }

    function stopBubble(e) {
        var e = window.event || e;
        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
    }

    
})(Zepto,window);