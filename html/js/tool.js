//from http://lpforth.forthfreak.net/
function SFentoPFen(s)
{
 var f=new String(),s1=new String(),w=new String(s.substr(s.length-2,2));
 s=s.substr(0,s.length-2);
 if(w==' b'){w=0;}else{w='';}
 s=s.replace(/\//g,'');
 for(x=0;x<s.length;x++)
 {
   f=s.charAt(x);
   if(f.toLowerCase()==f)f=f.toUpperCase();else f=f.toLowerCase();
   if(f=='B'){f='E';}
   if(f=='b'){f='e';}
   if(f=='A'){f='B';}
   if(f=='a'){f='b';}
   s1=s1+f;
 }
 s1=s1+w;
 return(s1);
}

//from http://www.dpxq.com/
function getbinit(s)
{
	var p = s.match(/([0-8]\d|99){32}(tree|tnew|tred|tall|next|\d{4})?/gi);
	if (p==null)
	{
		p=s.match(/([rnbakcp\d]{1,9}\/){9}[rnbakcp\d]{1,9}/gi);
		//rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r
		if (p==null)
		{
			p=s.match(/(\d{2,3} |0 ){32}/gi);
			if (p==null)
			{
				p=s.match(/PARAM +NAME="?position"? +VALUE="?(([a-i][0-9]|\-\-)(,|\|)){31}([a-i][0-9]|\-\-)"?/gi);
				if (p==null) p=s.match(/PARAM +VALUE="?(([a-i][0-9]|\-\-)(,|\|)){31}([a-i][0-9]|\-\-)"? +NAME="?position"?/gi);
				if (p==null)
				{
					p=pxqftxt(s);
					//\u5176\u4ED6\u672A\u77E5\u5C40\u9762\u5B57\u7B26\u4E32
				}
				else
				{
					p=p[0].toLowerCase().match(/(([a-i][0-9]|\-\-)(,|\|)){31}([a-i][0-9]|\-\-)/gi);
					p=p[0].replace(/,|\|/gi,'').replace(/\-/gi,'0').toLowerCase().split('');
					var posold='0123456789abcdefghi';
					var posnew='9876543210012345678'.split('');
					for (i=0;i<64;i++)
						p[i]=posnew[posold.indexOf(p[i])];
					p=p.join('');
				}
			}
			else
			{
				var b=[52,68,84,100,116,132,148,164,180,196];
				for(i=1;i<=9;i++)
					for(t=0;t<=9;t++)
						b[i*10+t]=(1000+b[t]+i).toString().substr(1);
				b[0]='052';b[1]='068';b[2]='084';b[99]='000';
				b=' '+b.join(' ')+' ';
				p=p[0].split(' ');
				//\u5175\u5175\u5175\u5175\u5175\u70AE\u70AE\u9A6C\u9A6C\u8F66\u8F66\u8C61\u8C61\u58EB\u58EB\u5E05
				t='9 7 11 13 15 14 12 8 10 5 6 0 1 2 3 4 25 23 27 29 31 30 28 24 26 21 22 16 17 18 19 20'.split(' ');
				for(i=0;i<32;i++)
					p[i]=(b.indexOf(' '+('000'+p[i]).replace(/.*(.{3})/gi,'$1')+' '))/4;
				for(i=0;i<32;i++)
					t[i]=('00'+p[t[i]]).replace(/.*(.{2})/gi,'$1');
				p=t.join('');
			}
		}
		else
		{
			p=p[0].replace(/9/g,'111111111').replace(/8/g,'11111111').replace(/7/g,'1111111').replace(/6/g,'111111').replace(/5/g,'11111').replace(/4/g,'1111').replace(/3/g,'111').replace(/2/g,'11').substr(0,99);
			var b='rnbakabnrccpppppRNBAKABNRCCPPPPP'.split('');
			var i;
			var t;
			for (i=0;i<=31;i++)
			{
				t=b[i];
				b[i]=(100+p.indexOf(b[i])).toString().replace(/.*(\d\d)$/gi,'$1').split('').reverse().join('');
				p=p.replace(t,'1');
			}
			p=b.join('').replace(/(\d{32})(\d{32})/gi,'$2$1');
		}
	}
	else
		p=p[0];
	//document.s.p.value = p;
	return p;
}