/*
	Platform Guy JS 
	Copyright 2010 DracSoft.com
	Started 8/1/2010 @ 18:00 GMT
	Finished 8/5/2010

	License: GPL v3
	THIS MUST BE DISTRIBUTED NON-MINIFIED AND NON-OBFUSCATED
	
	
	TODO: 	Click to add a platform (max of 1)
			Detect window resize and reinitialize
	
*/

//configurable options
var pfguy_o_hidesite = false;
var pfguy_o_fillplatforms = true;
var pfguy_o_difficulty = 1;

//settings
var pfguy_grav_y = 0.85;
var pfguy_jumpaccel = -14.0;
var pfguy_horizaccel = 0.1;
var pfguy_horizspeed = 6.0;
var pfguy_spritesize = 16;
var pfguy_debug = true;

//graphics
var pfguy_baddieURL = "data:image/gif;base64,R0lGODlhEAAQAOcCAAAAAH8AAP8ACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQBZAD/ACwAAAAAEAAQAAAIVQD/CRxIsGBBAQYRHhTAsKFDhQIFBJhIsSLEfxIZBtDIUeDEjB8pZuQosaJJkCQfotw4UuXGlxhNnowZU6ZIjBFVPkwYgKBEgxF7DvwJlGhQoEgLBgQAIfkEAWQA/wAsAAAAABAAEAAACFgA/wkcSLBgQQEGER4UwLChQ4UCBQSYSLEixH8SGQbQyJFgxokSQW6MqLGiyZAfHzbcmJKlSpYbY5q0mBHjTIv/RqpUmdNjAJ8GI/4cKDGoTaBBixIdKjAgADs=";
var pfguy_guyURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAOwQAADsEBuJFr7QAAAAd0SU1FB9oIBQIMCa4yDdwAAADnSURBVDjLlZI/TsMwFMZ/L8RSh+xdWKqmU1WJS3TtERhhY+MMvQIDh2JhqqKsPUC3FH0diINDHFt9kgc/P33/no350vtLsXtcUgG8PdvZNj8tYKTq8/hwAJQ6aln4+RHa05bXr28+1Lgkia07YkpqQGqc1Lg/tvSdIgA4DcwiW/2sQhnKSY9Z+e9jAtL7Jez7HmAeQBF5qQAdMCQZsl5s3VUxsIB13Pfs9/qPZaBE2hMFfe3LEDAHFvt8ky2k7Ehcirqr1OJsxRXA1FLa6jfRuRXm1qiZx6gtPytxLequtIhfy/3i8HID5cx4fplkGtsAAAAASUVORK5CYII=";

//general globals
var pfguy_keys = new Array();
var pfguy_platforms = new Array();
var pfguy_gamestarted = false;
var pfguy_winh=0;
var pfguy_winw=0;
//var pfguy_maxplatformdepth = 0;
//var pfguy_maxplatformdepthPercent = 0.95;

//game vars
var pfguy_x = 0;
var pfguy_x_accel = 0.0;
var pfguy_y = 0;
var pfguy_y_accel = 0.0;
var pfguy_resting = true;
var pfguy_restingplatform = null;
var pfguy_elem;
var pfguy_exitloop = false;

var pfguy_baddies = new Array();
var pfguy_goal;

function pfguy_FlipBaddie(baddie)
{
    if (baddie.direction==0)
        baddie.direction=1;
    else
        baddie.direction=0;
}

function pfguy_DoBaddies()
{
    for (var n=0; n<pfguy_baddies.length; n++)
    {
        var baddie = pfguy_baddies[n];
        
		//check up/down bounds/collision
		if (baddie.y>pfguy_winh-pfguy_spritesize-5) //floor
		{
			baddie.x = Math.floor(Math.random()*pfguy_winw);
			baddie.y = -100;
			baddie.y_accel = 0;
			baddie.resting = false;
			if (!baddie.isalive)
				baddie.elem.style.display = "none";
		}
		
        if (baddie.isalive)
        {
            //move left/right
            if (baddie.restingplatform!=null)
            {
                if (baddie.direction==0) //left
                    baddie.x -= baddie.speed;        
                else //right
                    baddie.x += baddie.speed;
                
                var posb = pfguy_GetElementPosition(baddie.restingplatform);				
		        var wb = baddie.restingplatform.offsetWidth;
		        var hb = baddie.restingplatform.offsetHeight;
		        var xb = posb[0];
		        var yb = posb[1];
                
                if (baddie.type=="platform_walker" && (baddie.x < xb || baddie.x > xb+wb-pfguy_spritesize))
                {
                    pfguy_FlipBaddie(baddie);
                    baddie.x = baddie.lastx;
                    if (baddie.x < xb) baddie.x=xb+1;
                    if (baddie.x > xb+wb-pfguy_spritesize) baddie.x = xb+wb-pfguy_spritesize-1;
                }
            }
			/*
			else if (baddie.type == "jumper")	//move anyway
			{
				if (baddie.direction==0) //left
                    baddie.x -= baddie.speed;        
                else //right
                    baddie.x += baddie.speed;
			}
			*/
        
	        //check left/right bounds	
	        if (baddie.x<0) { baddie.x = 0; pfguy_FlipBaddie(baddie); }
	        if (baddie.x>pfguy_winw-pfguy_spritesize-1) { baddie.x = pfguy_winw-pfguy_spritesize-1; pfguy_FlipBaddie(baddie); }
	
	        
	
	        if (!baddie.resting)
	        {
		        for (var j=0; j<pfguy_platforms.length; j++)
		        {
			        if (pfguy_platforms[j]!=null)
			        {
				        var pos1 = pfguy_GetElementPosition(pfguy_platforms[j]);
				
				        var w1 = pfguy_platforms[j].offsetWidth;
				        var h1 = pfguy_platforms[j].offsetHeight;
				        var x1 = pos1[0];
				        var y1 = pos1[1];
				
				        if (pfguy_DoRectIntersect(x1,y1,w1,h1,baddie.x,baddie.y,pfguy_spritesize,pfguy_spritesize))
				        {
					        					
					        if (baddie.y_accel > 0.0)
					        {
						        baddie.y = y1-pfguy_spritesize-1;
						        baddie.y_accel = 0;
						        baddie.resting = true;
						        baddie.restingplatform = pfguy_platforms[j];
					        }
					        else if (baddie.y_accel <= 0.0)
					        {
						        baddie.y = baddie.lasty;
						        baddie.y_accel = 0.0001;							
					        }
				        }
			        }
		        }
	        }
	        else if (baddie.restingplatform!=null) //check if player walked off the edge of a cliff
	        {
		        var pos1 = pfguy_GetElementPosition(baddie.restingplatform);
				
		        var w1 = baddie.restingplatform.offsetWidth;
		        var h1 = baddie.restingplatform.offsetHeight;
		        var x1 = pos1[0];
		        var y1 = pos1[1];
		        
		
		        if (baddie.type=="walker" || baddie.type=="jumper")
			    {
		            for (var j=0; j<pfguy_platforms.length; j++)
		            {
			            if (pfguy_platforms[j]!=null)// && pfguy_platforms[j]!=pfguy_restingplatform)
			            {
				            var pos2 = pfguy_GetElementPosition(pfguy_platforms[j]);
				
				            var w2 = pfguy_platforms[j].offsetWidth;
				            var h2 = pfguy_platforms[j].offsetHeight;
				            var x2 = pos2[0];
				            var y2 = pos2[1];
				
				            if (pfguy_DoRectIntersect(x2,y2,w2,h2,baddie.x,baddie.y,pfguy_spritesize,pfguy_spritesize))
				            {
					            baddie.x = baddie.lastx;
                    		    pfguy_FlipBaddie(baddie);
				            }
			            }
		            }
		        }
		
		        if (!pfguy_DoRectIntersect(x1,y1,w1,h1,baddie.x,baddie.y+pfguy_spritesize/2,pfguy_spritesize,pfguy_spritesize))
		        {
		            if (baddie.type == "walker" || baddie.type=="jumper")
		            {
		                baddie.resting=false;
		                baddie.y = baddie.lasty;
		                baddie.y_accel = 0.0001;		
		                baddie.restingplatform = null;
		            }	        			    
		        }
		        else 
		        {
			        baddie.y = y1-pfguy_spritesize-1;
			        baddie.y_accel = 0.0;	
					
					if (baddie.type=="jumper")
					{
						if (Math.floor(Math.random()*100) == 0)
						{
							baddie.resting=false;							
							baddie.y_accel = baddie.jumpspeed;		
							baddie.restingplatform = null;
						}
					}
		        }
	        }
	    }
    }
}

function pfguy_Loop()
{	
	if (pfguy_gamestarted)
	{
	
		if (document.body.scrollTop!=0)
			document.body.scrollTop=0;
		
		var lastx=pfguy_x;
		var lasty=pfguy_y;
	
		//movement left/right
		if (pfguy_keys[76]>0 || pfguy_keys[39]>0) //right - L
		{	
			pfguy_x += pfguy_horizspeed*pfguy_x_accel;
			if (pfguy_x_accel<1.0) pfguy_x_accel += pfguy_horizaccel;		
		}
		if (pfguy_keys[74]>0 || pfguy_keys[37]>0) //left - J
		{	
			pfguy_x -= pfguy_horizspeed*pfguy_x_accel;
			if (pfguy_x_accel<1.0) pfguy_x_accel += pfguy_horizaccel;		
		}
		
		//else 
		//{
		//	pfguy_x_accel =0.0;
		//}
		
		if (pfguy_keys[73]>0 || pfguy_keys[38]>0) //up - I
		{	
			if ((pfguy_keys[73]==1 || pfguy_keys[38]==1) && pfguy_resting)
			{
				pfguy_y_accel = pfguy_jumpaccel;
				pfguy_resting=false;
				pfguy_restingplatform = null;
			}
		}

		/* if (pfguy_keys[75]>0) //dwn K - 
		{	} */

        //move goal down until collision
        if (pfguy_goal.restingplatform==null)
        {
			if (pfguy_goal.y < pfguy_winh-35)
				pfguy_goal.y++;
            
            for (var j=0; j<pfguy_platforms.length; j++)
			{
				if (pfguy_platforms[j]!=null)
				{
					var pos1 = pfguy_GetElementPosition(pfguy_platforms[j]);
					
					var w1 = pfguy_platforms[j].offsetWidth;
					var h1 = pfguy_platforms[j].offsetHeight;
					var x1 = pos1[0];
					var y1 = pos1[1];
					
					if (pfguy_DoRectIntersect(x1,y1,w1,h1,pfguy_goal.x,pfguy_goal.y,30,35))
					{
						if (y1 >= 35)
							pfguy_goal.restingplatform = pfguy_platforms[j];
					}
				}
			}
        }

		//apply gravity to player
		if (!pfguy_resting)
		{		
			pfguy_y_accel += pfguy_grav_y;		
			pfguy_y += pfguy_y_accel;
		}
		
		//appy grav to baddies
		for (var b =0; b<pfguy_baddies.length;b++)
		{
			var baddie = pfguy_baddies[b];
			baddie.lastx = baddie.x;
			baddie.lasty = baddie.y;
			
			if (!baddie.resting)
			{
				baddie.y_accel += pfguy_grav_y;	
				if (baddie.y_accel > baddie.max_y_accel)
				    baddie.y_accel = baddie.max_y_accel;	
				baddie.y += baddie.y_accel;
			}
		}
		
		//check left/right bounds
		if (pfguy_x<0) pfguy_x = 0;
		if (pfguy_x>pfguy_winw-pfguy_spritesize-1) pfguy_x = pfguy_winw-pfguy_spritesize-1;
		
		//check up/down bounds/collision
		if (pfguy_y>pfguy_winh-pfguy_spritesize-25) //floor
		{
			pfguy_y =pfguy_winh-pfguy_spritesize-25;
			pfguy_y_accel = 0;
			pfguy_resting = true;
		}
		
		if (!pfguy_resting)
		{
		    //test if baddie is dead or not
		    for (var b=0; b<pfguy_baddies.length; b++)
		    {
		        var baddie = pfguy_baddies[b];
		        
		        if (baddie.isalive && pfguy_DoRectIntersect(baddie.x,baddie.y,pfguy_spritesize,pfguy_spritesize,pfguy_x,pfguy_y,pfguy_spritesize,pfguy_spritesize))
		        {
		            if (lasty+pfguy_spritesize-1 <= baddie.y) //baddie dead
		            {   
                        var decay = -0.8;
                        if (pfguy_y_accel < 0.0) //if player is already bouncing up, just decrease their accel. this should only happen if a player hits more than one guy at a time
                            decay = 0.8;
		                pfguy_y_accel = decay * pfguy_y_accel;
		                baddie.isalive=false;
    	                //baddie.elem.style.display = "none";
    	                baddie.elem.childNodes[0].style.height = "7px";
						baddie.elem.childNodes[0].style.width = pfguy_spritesize+"px";
						baddie.elem.childNodes[0].style.marginTop = "8px";
    	                baddie.y++;
		            }
		            else //player dead 
		            {
		                alert('youre dead');
		                pfguy_exitloop=true;
		            }
		        }
		    }
		
			for (var j=0; j<pfguy_platforms.length; j++)
			{
				if (pfguy_platforms[j]!=null)
				{
					var pos1 = pfguy_GetElementPosition(pfguy_platforms[j]);
					
					var w1 = pfguy_platforms[j].offsetWidth;
					var h1 = pfguy_platforms[j].offsetHeight;
					var x1 = pos1[0];
					var y1 = pos1[1];
					
					if (pfguy_DoRectIntersect(x1,y1,w1,h1,pfguy_x,pfguy_y,pfguy_spritesize,pfguy_spritesize))
					{
						if (pfguy_x_accel!=0.0)
						{
							pfguy_x = lastx;
							//pfguy_x_accel=0;
						}
						
						if (pfguy_y_accel > 0.0)
						{
							pfguy_y = lasty;
							pfguy_y_accel = 0;
							pfguy_resting = true;
							pfguy_restingplatform = pfguy_platforms[j];
						}
						else if (pfguy_y_accel <= 0.0)
						{
							pfguy_y = lasty;
							pfguy_y_accel = 0.0001;							
						}
					}
				}
			}
		}
		else if (pfguy_restingplatform!=null) //check if player walked off the edge of a cliff
		{
		    //test for death by baddie
			for (var b=0; b<pfguy_baddies.length; b++)
		    {
		        var baddie = pfguy_baddies[b];
		        
		        if (baddie.isalive && pfguy_DoRectIntersect(baddie.x,baddie.y,pfguy_spritesize,pfguy_spritesize,pfguy_x,pfguy_y,pfguy_spritesize,pfguy_spritesize))
		        {
		            alert('youre dead');
	                //pfguy_elem.style.display="none";
	                pfguy_exitloop = true;
		        }
		    }
			
			//test for victory
			if (pfguy_DoRectIntersect(pfguy_x,pfguy_y,pfguy_spritesize,pfguy_spritesize,pfguy_goal.x,pfguy_goal.y,30,35))
			{
			    alert('you win!');
			    pfguy_exitloop = true;
			}
			
			//check current platform
			var pos1 = pfguy_GetElementPosition(pfguy_restingplatform);
					
			var w1 = pfguy_restingplatform.offsetWidth;
			var h1 = pfguy_restingplatform.offsetHeight;
			var x1 = pos1[0];
			var y1 = pos1[1];
			
			for (var j=0; j<pfguy_platforms.length; j++)
			{
				if (pfguy_platforms[j]!=null)// && pfguy_platforms[j]!=pfguy_restingplatform)
				{
					var pos2 = pfguy_GetElementPosition(pfguy_platforms[j]);
					
					var w2 = pfguy_platforms[j].offsetWidth;
					var h2 = pfguy_platforms[j].offsetHeight;
					var x2 = pos2[0];
					var y2 = pos2[1];
					
					if (pfguy_DoRectIntersect(x2,y2,w2,h2,pfguy_x,pfguy_y,pfguy_spritesize,pfguy_spritesize))
					{
						if (pfguy_x_accel!=0.0)
							pfguy_x = lastx;
					}
				}
			}
			
			if (!pfguy_DoRectIntersect(x1,y1,w1,h1,pfguy_x,pfguy_y+pfguy_spritesize/2,pfguy_spritesize,pfguy_spritesize))
			{				
				pfguy_resting=false;
				pfguy_y = lasty;
				pfguy_y_accel = 0.0001;		
				pfguy_restingplatform = null;
			}
			else 
			{
				pfguy_y = y1-pfguy_spritesize-1;
				pfguy_y_accel = 0.0;	
			}			
		}
		
		//check baddie positions/platforms
		pfguy_DoBaddies();
		
		//update elem positions and start again
		pfguy_elem.style.left = pfguy_x+"px";
		pfguy_elem.style.top = pfguy_y+"px";
		
		for (var b=0; b<pfguy_baddies.length;b++)
		{
			var baddie = pfguy_baddies[b];
			baddie.elem.style.left = baddie.x+"px";
			baddie.elem.style.top = baddie.y+"px";
		}
		
		pfguy_goal.elem.style.top = pfguy_goal.y+"px";
	}
	
	if (!pfguy_exitloop)
	    setTimeout('pfguy_Loop()', 33);
}

function pfguy_keydown(event)
{
	var keyCode=0;
	if (typeof event.which == "undefined") {
		keyCode = event.keyCode;
	}else{
		keyCode = event.which;
	}
	
	pfguy_keys[keyCode]++;
	
	return false;
}

function pfguy_keyup(event)
{
	var keyCode=0;
	if (typeof event.which == "undefined") {
		keyCode = event.keyCode;
	}else{
		keyCode = event.which;
	}
	
	pfguy_keys[keyCode]=0;
	
	if (pfguy_keys[73]==0 && pfguy_y_accel<0 && keyCode==73)
		pfguy_y_accel = pfguy_y_accel/3.0;		
	else if (pfguy_keys[76]==0 && keyCode==76)
		pfguy_x_accel = 0.0;
	else if (pfguy_keys[74]==0 && keyCode==74)
		pfguy_x_accel = 0.0;
		
	if (pfguy_keys[38]==0 && pfguy_y_accel<0 && keyCode==38)
		pfguy_y_accel = pfguy_y_accel/3.0;		
	else if (pfguy_keys[39]==0 && keyCode==39)
		pfguy_x_accel = 0.0;
	else if (pfguy_keys[37]==0 && keyCode==37)
		pfguy_x_accel = 0.0;
		
	return false;
}

function pfguy_GetElementPosition(obj) 
{
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft
		curtop = obj.offsetTop
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
	}
	return [curleft,curtop];
}

function pfguy_SearchForPlatforms(parent, depth)
{
	if (depth>250) return;
	
	//if (depth > pfguy_maxplatformdepth) pfguy_maxplatformdepth = depth;
	
	for (var j=0; j<parent.childNodes.length; j++)
		pfguy_SearchForPlatforms(parent.childNodes[j], depth+1);
	
	//if (depth >= pfguy_maxplatformdepth * pfguy_maxplatformdepthPercent)
	//{
	
		var tag=parent.tagName;
		if (typeof tag!="undefined") tag=tag.toLowerCase();
		
		/*
		if (tag=="div")
		{
			if (parent.style.display=="" || parent.style.display=="block")
				if (parent.style.zIndex=="" || parent.style.zIndex=="0" || parent.style.zIndex==0)
					//if (parent.offsetWidth < pfguy_winw/2 && parent.offsetHeight < pfguy_winh/2)
						pfguy_platforms.push(parent);
		}
		else if (tag=="td" || tag=="img" || tag=="input" || tag=="li")
		{
			if (parent.style.display=="" || parent.style.display=="block")
				if (parent.style.zIndex=="" || parent.style.zIndex=="0" || parent.style.zIndex==0)
					pfguy_platforms.push(parent);		
		}
		*/
		
		if (tag=="a" || tag=="img" || tag=="input" || tag=="textarea" || tag=="select" || tag=="embed" || tag=="object")
		{
			if (parent.style.display!="none" && parent.style.visibility!="hidden")
				//if (parent.style.zIndex=="" || parent.style.zIndex=="0" || parent.style.zIndex==0)
					{
						var pos = pfguy_GetElementPosition(parent);
						if (pos[1]<=pfguy_winh)
							pfguy_platforms.push(parent);	
					}
		}
	//}
	
	pfguy_maxplatformdepth = depth;
}

function pfguy_DoRectIntersect(rx1,ry1,rw1,rh1,rx2,ry2,rw2,rh2)
{
	var tw = rw1;
	var th = rh1;
	var rw = rw2;
	var rh = rh2;
	if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0) {
	return false;
	}
	var tx = rx1;
	var ty = ry1;
	var rx = rx2;
	var ry = ry2;

	rw = rw+rx;
	rh = rh+ry;
	tw = tw+tx;
	th = th+ty;

	if ((rw < rx || rw > tx) &&
	(rh < ry || rh > ty) &&
	(tw < tx || tw > rx) &&
	(th < ty || th > ry)) {
	return true;
	} else {
	return false;
	}
}

function pfguy_BuildPlatforms()
{
	//scan DOM for potential platforms
	var body = document.getElementsByTagName("body")[0];
	pfguy_SearchForPlatforms(body, 1);

	//clean intersecting platforms
	for (var j=0; j<pfguy_platforms.length; j++)
	{		
		if (pfguy_platforms[j]!=null)
		{
	
			var pos1 = pfguy_GetElementPosition(pfguy_platforms[j]);
			
			var w1 = pfguy_platforms[j].offsetWidth;
			var h1 = pfguy_platforms[j].offsetHeight;
			var x1 = pos1[0];
			var y1 = pos1[1];
			
			for (var k=0; k<pfguy_platforms.length; k++)
			{
				if (pfguy_platforms[k]!=null && pfguy_platforms[k]!=pfguy_platforms[j])
				{
					var pos2 = pfguy_GetElementPosition(pfguy_platforms[k]);
				
					var w2 = pfguy_platforms[k].offsetWidth;
					var h2 = pfguy_platforms[k].offsetHeight;
					var x2 = pos2[0];
					var y2 = pos2[1];
					
					if (pfguy_DoRectIntersect(x1,y1,w1,h1,x2,y2,w2,h2))
					{
						if (pfguy_debug)
						{		
							/*
							var el = document.createElement("div");
							el.style.width=w2+"px";
							el.style.height=h2+"px";
							el.style.top=y2+"px";
							el.style.left=x2+"px";
							el.style.opacity="0.80";
							el.style.zIndex="9999998";
							el.style.backgroundColor = "#0f0";
							el.style.position = "absolute";
							
							body.appendChild(el);						
							*/
							//pfguy_platforms[k].style.border = "solid 2px #0f0";					
						}
						
						pfguy_platforms[k] = null;					
					}
				}
			}
		}
	}
	
	//debug mode? then draw solid  blocks where potential platforms are detected
	if (pfguy_debug)
	{		
		for (var i=0; i<pfguy_platforms.length; i++)
		{
			if (pfguy_platforms[i] != null)
			{
				var pos = pfguy_GetElementPosition(pfguy_platforms[i]);
				
				var el = document.createElement("div");
				el.style.width=(pfguy_platforms[i].offsetWidth-6)+"px";
				el.style.height=(pfguy_platforms[i].offsetHeight-6)+"px";
				el.style.top=pos[1]+"px";
				el.style.left=pos[0]+"px";
				//el.style.opacity="0.750";
				el.style.zIndex="8888888";
				if (pfguy_o_fillplatforms)
    				el.style.backgroundColor = "#2d2";
				el.style.position = "absolute";
				el.style.border = "outset 3px #2d2";
				
				body.appendChild(el);			
				
				//pfguy_platforms[i].style.border = "solid 2px #f00";
			}
		}
	}
}

function pfguy_Init()
{	
	//get window dimensions
	pfguy_winh = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
	pfguy_winw = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth;
	
	//scan html for 'platforms'
	pfguy_BuildPlatforms();
	if (pfguy_o_hidesite)
	{
	    var block = document.createElement("div");
	    
	    var bodyblock = document.getElementsByTagName("body")[0];
	    bodyblock.appendChild(block);
	
	    block.style.width = pfguy_winw+"px";
	    block.style.height = pfguy_winh+"px";
	    block.style.position = "absolute";
	    block.style.backgroundColor = "#000";
	    block.style.border = "none";
	    block.style.zIndex = "1111111";
	    block.style.top = "0px";
	    block.style.left = "0px";    
	}
	
	//insert player
	var im = document.createElement("div");
	var im2 = document.createElement("img");
	im2.src = pfguy_guyURL;
	im.appendChild(im2);
	pfguy_elem = im;
	
	var body = document.getElementsByTagName("body")[0];
	body.appendChild(im);
	
	pfguy_y = pfguy_winh-pfguy_spritesize-5;
	im.style.position = "absolute";
	im.style.zIndex = "9999999";
	im.style.top = pfguy_y+"px";
	im.style.left = pfguy_x+"px";
	
	//insert goal
	pfguy_goal = new Object();
    var gim = document.createElement("div");
	pfguy_goal.elem = gim;
	pfguy_goal.x = Math.floor(Math.random()*pfguy_winw-100)+50;
	pfguy_goal.y = -50;
	pfguy_goal.restingplatform=null;
	
	var body = document.getElementsByTagName("body")[0];
	body.appendChild(gim);
	
	gim.style.width = "30px";
	gim.style.height = "35px";
	gim.style.position = "absolute";
	gim.style.backgroundColor = "#0ff";
	gim.style.border = "inset 2px #b00";
	gim.style.zIndex = "7777777";
	gim.style.top = pfguy_goal.y+"px";
	gim.style.left = pfguy_goal.x+"px";
	
	//insert bottom floor					
	var el = document.createElement("div");
	el.style.width=pfguy_winw+"px";
	el.style.height="25px";
	el.style.top=(pfguy_winh-25)+"px";
	el.style.left="0px";	
	el.style.zIndex="8888888";
	if (pfguy_o_fillplatforms)
		el.style.backgroundColor = "#2d2";
	el.style.position = "absolute";
	el.style.border = "outset 3px #2d2";	
	body.appendChild(el);	
	
	//insert baddies
	for (var j=0; j < pfguy_winw / 100 / (5-pfguy_o_difficulty) + pfguy_winh / 100 / (5-pfguy_o_difficulty); j++)
	{
		var bim = document.createElement("div");
		var bim2 = document.createElement("img");
		bim2.src = pfguy_baddieURL;
		bim.appendChild(bim2);
		
		body.appendChild(bim);
		
		var typenum = Math.floor(Math.random()*3);
		var btype = ""; var bspeed = 1;
		var bimo = new Object();
		
		switch (typenum)
		{
		    case 0: btype = "platform_walker"; bspeed = 1.33; break;
		    case 1: btype = "walker"; bspeed = 1; break;
			case 2: btype = "jumper"; bspeed = 1; bimo.jumpspeed = -7; break;
		}
		
		var bx = Math.floor(Math.random()*pfguy_winw);
		var by = Math.floor(Math.random()*pfguy_winh/2);;
		
		bim.style.position = "absolute";
		bim.style.zIndex = "9999998";
		bim.style.top = by+"px";
		bim.style.left = bx+"px";
				
		bimo.type = btype;
		bimo.speed = bspeed;
		bimo.direction = Math.floor(Math.random()*2); //0 - left, 1 - right
		bimo.x = bx;
		bimo.y = by;
		bimo.lastx = bx;
		bimo.lasty = by;
		bimo.resting = false;
		bimo.y_accel = 0.0;		
		bimo.restingplatform = null;
		bimo.elem = bim;
		bimo.isalive=true;
		bimo.max_y_accel = 8;		
		
		pfguy_baddies.push(bimo);
	}
	
	//add events
	pfguy_addKBDEvent( pfguy_keydown );
	pfguy_addKBUEvent( pfguy_keyup );
	
	for (var i=0; i<512; i++)
		pfguy_keys[i]=0;	
	
	//start game	
	pfguy_gamestarted=true;
	setTimeout('pfguy_Loop()', 30);
}

function pfguy_addKBDEvent(func) { 
  var oldonload = document.onkeydown; 
  if (typeof document.onkeydown != 'function') { 
    document.onkeydown = func; 
  } else { 
    document.onkeydown = function() { 
      if (oldonload) { 
        oldonload(); 
      } 
	  func(); 
	} 
  } 
} 

function pfguy_addKBUEvent(func) { 
  var oldonload = document.onkeyup; 
  if (typeof document.onkeyup != 'function') { 
    document.onkeyup = func; 
  } else { 
    document.onkeyup = function() { 
      if (oldonload) { 
        oldonload(); 
      } 
	  func(); 
	} 
  } 
} 

function pfguy_addLoadEvent(func) { 
  var oldonload = window.onload; 
  if (typeof window.onload != 'function') { 
    window.onload = func; 
  } else { 
    window.onload = function() { 
      if (oldonload) { 
        oldonload(); 
      } 
	  func(); 
	} 
  } 
} 

pfguy_addLoadEvent( pfguy_Init );

