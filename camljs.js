var globalSimpleCamlJSManager={};
function simpleCamlJS(where,textArea,fields){
var options={};
options.whereId=where;
options.textAreaId=textArea;
options.fields=fields;

String.prototype.format = function (){
    var args = arguments;
    return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (curlyBrack, index) {
        return ((curlyBrack == "{{") ? "{" : ((curlyBrack == "}}") ? "}" : args[index]));
    });
};

/**
 * Return direct children elements.
 *
 * @param {HTMLElement}
 * @return {Array}
 */
function elementChildren (element) {
    var childNodes = element.childNodes,
        children = [],
        i = childNodes.length;

    while (i--) {
        if (childNodes[i].nodeType == 1) {
            children.unshift(childNodes[i]);
        }
    }

    return children;
}

var opTemp="<{0}>{1}{2}</{0}>";
var operTemp="<{0}>{1}{2}</{0}>";
var fieldTemp="<FieldRef {0}/>";
var valTemp="<Value Type='{0}'>{1}</Value>";
var result="<where>{0}</where>";
var textQuery=document.getElementById(options.textAreaId);

var templateHTML="<div class='camlTag' id='camlTag'>\
<select class='fieldname' onchange='globalSimpleCamlJSManager.setLookuptype(this)'>\
</select>\
<select class='lookupType'>\
<option value='true'>ID</option>\
<option value='false' >Text</option>\
</select>\
<select class='operation'>\
<option value='Eq'>Equal</option>\
<option value='Lt'>LT</option>\
<option value='Gt'>Gt</option>\
<option value='Leq'>Leq</option>\
<option value='Geq'>Geq</option>\
<option value='Contains'>Contains</option>\
<option value='BeginsWith'>BeginsWith</option>\
<option value='Neq'>Neq</option>\
<option value='IsNotNull'>IsNotNull</option>\
<option value='IsNull'>IsNull</option>\
<option value='In'>In</option>\
</select>\
<select class='valueType' onChange='globalSimpleCamlJSManager.slectedValueType(this)'>\
<option value='Value'>Value</option>\
<option value='<UserId/>'>[me]</option>\
<option value='<Today/>'>Today</option>\
</select>\
<input type='text' id='value' class='value'/>\
<select class='operators' onChange='globalSimpleCamlJSManager.slectedOperator(this)'>\
<option value='none'>none</option>\
<option value='And'>And</option>\
<option value='Or'>Or</option>\
</select>\
<div id='placeholder' class='placeholder'></div>\
</div>";

var defaultFields=[{internalName:"Parent",displayName:"Parent",type:"Lookup"},
{internalName:"Phone",displayName:"Phone",type:"Integer"},
{internalName:"ID",displayName:"ID",type:"Count"},
{internalName:"Title",displayName:"Title",type:"Text"},
{internalName:"Author",displayName:"Author",type:"User"}];

var parser = new DOMParser();

var txmlDoc = parser.parseFromString(templateHTML,"text/html");

var newNode=txmlDoc.getElementById('camlTag');

if(options.fields ==null)
	options.fields=defaultFields;

var selectFieldsTemplate=newNode.getElementsByClassName('fieldname')[0];

for (var i = 0; i<options.fields.length; i++){
    var opt = document.createElement('option');
	var row=options.fields[i];
    opt.value = row["internalName"];
    opt.innerHTML = row["displayName"];
	opt.setAttribute("data-type",row["type"]);
    selectFieldsTemplate.appendChild(opt);
}

var whereDiv=document.getElementById(options.whereId);
whereDiv.appendChild(newNode.cloneNode(true));

function buildQuery(node){
var operator=node.getElementsByClassName('operators')[0];
var fieldname=node.getElementsByClassName('fieldname')[0];
var operation=node.getElementsByClassName('operation')[0];
var valueType=node.getElementsByClassName('valueType')[0];

var nextQuery=node.getElementsByClassName('camlTag')[0];
var fieldType=fieldname.options[fieldname.selectedIndex].getAttribute("data-type");

var setValue="";

if(valueType.value=="Value"){
setValue=node.getElementsByClassName('value')[0].value;
}
else{
setValue=valueType.value;
}
var lookupid="false";
if(fieldType=="Lookup"){
var lookupType=node.getElementsByClassName('lookupType')[0];

lookupid=lookupType.value;
}


var v2=valTemp.format(fieldType,setValue);

var xmlFieldAttr="Name='{0}' LookupId='{1}'";
if(lookupid=='true'){
xmlFieldAttr=xmlFieldAttr.format(fieldname.value,lookupid);
}else{
xmlFieldAttr="Name='{0}'";
xmlFieldAttr=xmlFieldAttr.format(fieldname.value);
}
if(nextQuery!=null && operator.value!="none" ){

var nodeR=opTemp.format(operator.value,operTemp.format(operation.value,fieldTemp.format(xmlFieldAttr),v2),"{0}");

result=result.format(nodeR);
return buildQuery(nextQuery);
}else{

var nodeR=operTemp.format(operation.value,fieldTemp.format(xmlFieldAttr),v2);
result=result.format(nodeR);
return;
}
}

function initQuerybuilder(){
 result="<where>{0}</where>";
var q=document.getElementById(where);

buildQuery(elementChildren(q)[0]);

console.log(result);
textQuery.value=result;

}


function slectedValueType(that){
var valueText=that.value;

var valueTxtBox=that.nextElementSibling;
if(valueText!="Value"){
valueTxtBox.style.display="none";

}
else{
valueTxtBox.style.display="inline";
}
}
function slectedOperator(that){
//var newNode=elementChildren(document.getElementById("queryTemp"))[0];

var p=that.parentElement;
var nextChild=that.nextElementSibling;
if(nextChild.id!="camlTag")
p.replaceChild(newNode.cloneNode(true),that.nextElementSibling);

}

function setLookuptype(that)
{
var valueText=that.value;
var fieldType=that.options[that.selectedIndex].getAttribute("data-type");

var p=that.parentElement;
var lookupTypeNode=p.getElementsByClassName("lookupType")[0];
if(fieldType=="Lookup"){
lookupTypeNode.style.display="inline";
}else{
lookupTypeNode.style.display="none";
}
}


//var newNode=elementChildren(document.getElementById("queryTemp"))[0];

function buildHtml(firstNode,p){
if(firstNode.nodeName=="And" || firstNode.nodeName=="Or"){


buildHtml(elementChildren(firstNode)[0],firstNode.nodeName);
if(elementChildren(firstNode)[1].nodeName=="And" || elementChildren(firstNode)[1].nodeName=="Or"){

buildHtml(elementChildren(firstNode)[1]);
}else{
buildHtml(elementChildren(firstNode)[1],"none");
}

}
else{
	
	
var tem=newNode.cloneNode(true);

	var textQueryPH=queryResult.getElementsByClassName('placeholder');
textQueryPH[0].parentElement.replaceChild(tem,textQueryPH[0]);


var nextQuery=tem.getElementsByClassName('operators')[0];

nextQuery.value=p;

var operation=tem.getElementsByClassName('operation')[0];

operation.value=firstNode.nodeName;

var FieldRef=firstNode.getElementsByTagName("FieldRef");

var FieldRefName=FieldRef[0].getAttribute("Name");

var FieldRefNameTag=tem.getElementsByClassName('fieldname')[0];
FieldRefNameTag.value=FieldRefName;

var lookupTypeNameTag=tem.getElementsByClassName('lookupType')[0];
var fieldType=FieldRefNameTag.options[FieldRefNameTag.selectedIndex].getAttribute("data-type");
if(fieldType=="Lookup"){
lookupTypeNameTag.style.display='inline';
//lookupTypeNameTag.style.width='inherit';
var FieldLookupId=FieldRef[0].getAttribute("LookupId");
if(FieldLookupId=="true"){
lookupTypeNameTag.value="true";
}else{
lookupTypeNameTag.value="false";
}
}
else{
lookupTypeNameTag.style.display='none';
//lookupTypeNameTag.style.width='0px';
}
var ValueTag=firstNode.getElementsByTagName("Value");

var valueType=tem.getElementsByClassName('valueType')[0];

var valueText=ValueTag[0].innerHTML;

var valueTxtBox=tem.getElementsByClassName('value')[0];
if(valueText=="<UserId/>" || valueText=="<Today/>"){
valueType.value=valueText;

valueTxtBox.style.display="none";
//valueTxtBox.style.width="0px";
}
else{
valueType.value="Value";

valueTxtBox.value=valueText;

}




}

}

function generateUIFromXml(){

var q=document.getElementById(where);

q.innerHTML="";

var div=document.createElement("div");

div.id="placeholder";
div.className="placeholder";

q.appendChild(div);

var textAreaValue=document.getElementById(options.textAreaId).value;

var parser = new DOMParser();

var txmlDoc = parser.parseFromString(textAreaValue,"text/xml");

queryResult=document.getElementById(options.whereId);;

var firstNode=elementChildren(elementChildren(txmlDoc)[0])[0];

var textValue;
buildHtml(firstNode);

}


 globalSimpleCamlJSManager={slectedValueType:function(that){slectedValueType(that);},
		slectedOperator:function(that){slectedOperator(that);},
		setLookuptype:function(that){setLookuptype(that);},
		generateUIFromXml:function(){generateUIFromXml()},
		generateUIFromXml:function(){generateUIFromXml()},
		initQuerybuilder:function(){initQuerybuilder();}
			};
			
return globalSimpleCamlJSManager;
}