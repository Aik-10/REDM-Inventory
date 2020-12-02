var dragging = false;
var draggingid = "none";
var mousedown = false;
var personalWeight = 0;
var secondaryWeight = 0;
var personalMaxWeight = 250;
var secondaryMaxWeight = 100;
var movementAmount = 0;
var currentInventory = 0;
var weight = 0;
var amount = 0;
var name = 0;
var itemid = 0;
var slotusing = 0;
var inventoryUserName = "none";
var curGPSlenght = 0;
var cursorX = 0;
var cursorY = 0;
var purchase = false;
var crafting = false;
var userCash = 0;
var clicking = true;
var sqlInventory = {}
var itemCount = 0

var itemList = {};

$(document).ready(function() {
	document.onmousemove = handleMouseMove;
	function handleMouseMove(event){
		var dot,eventDoc, doc, body, pageX, pageY;
		evebt = event || window.event;

		if (event.pageX == null && event.clientX != null){
			eventDoc = (event.target && event.target.ownerDocument) || document;
			doc = eventDoc.documentElement;
			body = eventDoc.body;

			event.pageX = event.clientX + (doc && doc.srcollLeft || body.srcollLeft || 0) - (doc && doc.srcollLeft || body.srcollLeft || 0);

			event.pageY = event.clientY + (doc && doc.srcollTop || body.srcollTop || 0) - (doc && doc.srcollTop || body.srcollTop || 0);
		}

		cursorX = event.pageX 
		cursorY = event.pageY

		if (dragging){
			document.getElementById('draggedItem').style.left = '' + cursorX-50 + '';
			document.getElementById('draggedItem').style.top = '' + cursorY-50 + '';
		}
	}
});

function BuildDrop(itemListArrey) {
	$.post("http://inventory/dropIncorrectItems", JSON.stringify( { items: itemListArrey } ))
}

document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("message", (event) => {
        let item = event.data;

        if(item.response == "OpenGui") {

        	document.getElementById('wrapmain').innerHTML = "";
			document.getElementById('wrapsecondary').innerHTML = "";
			// document.getElementById('search-text').value = "";
			document.getElementById('app').style.display = 'block';

		}else if (item.response == "cashUpdate"){
			userCash = item.amount
		} else if (item.response == "toggleDebug"){
			if (item.debug == true){
				document.getElementById('Logs').style.display = 'block';
			}else{
				document.getElementById('Logs').style.display = 'none';
			}
			
			
		}else if (item.response == "CloseGui") {

			document.getElementById('app').style.display = 'none';
		}else if (item.response == "Populate"){
			DisplayInventoryMultiple(item.playerinventory,item.itemCount,item.invName,item.targetinventory,item.targetitemCount,item.targetinvName,item.cash);
		} else if (item.response == "PopulateSingle"){

			DisplayInventoryInit(item.playerinventory,item.itemCount,item.invName, true);
		} else if (item.response == "EnableMouse"){
			clicking = true;
		} else if ( item.response == "DisableMouse"){
			clicking = false;
			EndDrag(slotusing)
			EndDrag(draggingid)
			dragging = false;
			draggingid = "none"
			document.getElementById("draggedItem").style.opacity = '0.0';
			document.getElementById("draggedItem").innerHTML = "";

		} else if (item.response == "SetItemData"){
			itemList = item.itemLis
		} else if (item.response == "DisplayBar"){
			ToggleBar(item.toggle, item.boundItems, item.boundItemsAmmo)
		} else if (item.response == "UseBar"){
			UseBar(item.itemid,item.text)
		}

    })
});

let usedBar = 0

function UseBar(itemid, text) {
	document.getElementById("UseBar").innerHTML = "";

	let image = ""
	let name = ""
	let htmlsting = ""

	image = itemList[itemid].image;
	name = itemList[itemid].displayname;

	htmlsting = "<div id='name1'> " + text + " </div> <div class='item'> <div class='item-name'> " + name + " </div> <img src='icons/"+ image +"' class='itemimage'> </div>";
	document.getElementById("UseBar").innerHTML = htmlsting

	$("#UseBar").fadeIn(500);

	clearTimeout(usedBar)
	usedBar = setTimeout(function(){
		$("#UseBar").fadeOut(1000);
	}, 1000);
}

function ToggleBar(toggle, boundItems, boundItemsAmmo) {
	if (toggle){
		document.getElementById("DisplayBar").innerHTML = ""

		let image = ""
		let name = ""
		let htmlsting = ""

		if (boundItems[1]) {
			image = itemList[boundItems[1]].image
			name = itemList[boundItems[1]].displayname

			if (boundItemsAmmo[1]){
				name = name + " - (" + boundItemsAmmo[1] + ")"
			}

			htmlsting = "<div id='bind1'> 1 </div> <div class='item'> <div class='item-name'> " + name + " </div> <img src='icons/"+ image +"' class='itemimage'>	</div>"
		} else {
			htmlsting = "<div id='bind1'> 1 </div> <div class='item'> <div class='item-name'> Ei Bindattu </div> 	</div>" // <img src='icons/empty.png' class=''>
		}

		for ( let i = 2; i < 5; i++){
			if (boundItems[i]) {
				image = itemList[boundItems[i]].image;
				name = itemList[boundItems[i]].displayname;


				if (boundItemsAmmo[i]){
					name = name + " - (" + boundItemsAmmo[i] + ")"
				}
				htmlsting = htmlsting + "<div id='bind"+i+"'> "+i+" </div> <div class='item'> <div class='item-name'> " + name + " </div> <img src='icons/"+ image +"' class='itemimage'>	</div>"
			}else {
				htmlsting = htmlsting + "<div id='bind"+i+"'> "+i+" </div> <div class='item'> <div class='item-name'> Ei Bindattu </div> 	</div>" //<img src='icons/empty.png' class=''>
			}
		}
		document.getElementById("DisplayBar").innerHTML = htmlsting;
		document.getElementById("DisplayBar").style.display = "block";
	}else {
		document.getElementById("DisplayBar").style.display = "none";
	}
}

document.onkeyup = function(data){
	if (data.which == 27){
		closeInv()
	}
}

function invStack(targetSlot, moveAmount,targetInventory,originSlot,originInventory,purchase,itemCosts,itemidsent,moveAmount,crafting){
	let arr = [targetSlot, moveAmount,targetInventory,originSlot,originInventory,purchase,itemCosts,itemidsent,moveAmount,crafting];
	$.post("http://inventory/stack", JSON.stringify(arr));
}

function invMove(targetSlot,originSlot,targetInventory,originInventory,purchase,itemCosts,itemidsent,moveAmount,crafting){
	let arr = [targetSlot,originSlot,targetInventory,originInventory,purchase,itemCosts,itemidsent,moveAmount,crafting];
	$.post("http://inventory/move", JSON.stringify(arr));
}

function invSwap(targetSlot,targetInventory,originSlot,originInventory){
	let arr = [targetSlot,targetInventory,originSlot,originInventory];
	$.post("http://inventory/swap",JSON.stringify(arr));
}

function removeCraftItems(refinedwood,plastic,rubber,steel){
	let arr = [refinedwood,plastic,rubber,steel];
	$.post("http://inventory/removeCraftItems", JSON.stringify(arr));
}

function InventoryLog(string){
	document.getElementById('Logs').innerHTML = string + "<br>" + document.getElementById('Logs').innerHTML;
}

var PlayerInventoryName = "none";
var TargetInventoryName = "none";
var shop = "Shop";
var craft = "Craft";
var slotLimitTarget = 40;
var myInventory = {}
var MyItemCount = 0;


function isEmpty(obj){
	for (var key in obj) {
		if(obj.hasOwnProperty(key)){
			return false;
		}
	}
	return true;
}

function DisplayInventoryMultiple(playerinventory,itemCount,invName,targetInventory,targetitemCount,targetinvName,cash) {
	userCash = parseInt(cash)
	DisplayInventory(playerinventory,itemCount,invName,true)

	myInventory = playerinventory
	MyItemCount = itemCount;
	if(targetinvName.indexOf("Pudota") > -1){
		secondaryMaxWeight = 1000.0
		slotLimitTarget = 35;
	}else if (targetinvName.indexOf("Hanskalokero") > -1){
		secondaryMaxWeight = 50.0
		slotLimitTarget = 5
	}else if (targetinvName.indexOf("Takakontti") > -1){
		secondaryMaxWeight = 350.0
		slotLimitTarget = 35
	}else if (targetinvName.indexOf("hidden") > -1){
		secondaryMaxWeight = 500.0
		slotLimitTarget = 50
	}else {
		secondaryMaxWeight = 200.0
		slotLimitTarget = 15
	}
	InventoryLog(targetinvName + " | " + invName)
	DisplayInventory(targetInventory,targetitemCount,targetinvName,false)
}

function DisplayInventoryInit(sqlInventory,itemCount,invName,main) {

	clicking = false
	EndDrag(slotusing)
	EndDrag(draggingid)

	dragging = false;
	draggingid = "none"
	document.getElementById("draggedItem").style.opacity = '0.0';
	document.getElementById("draggedItem").innerHTML = "";

	var sqlInventory = JSON.parse(sqlInventory)

	let maxWeight = 250
	let slotLimit = 40

	let inventory = {}
	itemCount = parseInt(itemCount);

	PlayerInventoryName = invName;
	document.getElementById("wrapmain").innerHTML = "";
	CreateEmptyPersonalSlot(slotLimit);

	let inventoryNumber = 1;
	if (!main){
		inventoryNumber = 2;
	}

	myInventory = sqlInventory
	MyItemCount = itemCount
	personalWeight = 0
	InventoryLog(invName + " is Loading")

	let slot = 0;
	let failure = false;
	let fixSlots = {};

	for (let i = 0; i < itemCount; i++) {

		slot = sqlInventory[i].slot
		if ( isEmpty(inventory[slot]) ) {
			//Do something

			inventory[slot] = {}
			inventory[slot].slot = slot
			inventory[slot].itemid = sqlInventory[i].item_id
			inventory[slot].itemcount = 1
			inventory[slot].inventoryName = sqlInventory[i].name

		}else {
			if (sqlInventory[i].item_id != inventory[slot].itemid){
				if (fixSlots[sqlInventory[i].item_id]){
					fixSlots[sqlInventory[i].item_id].push(sqlInventory[i].id)
				}else {
					fixSlots[sqlInventory[i].item_id] = []
					failure = true
					fixSlots[sqlInventory[i].item_id].push(sqlInventory[i].id)
				}
			}else {
				inventory[slot].itemcount = inventory[slot].itemcount + 1
			}
			
		}
	}

	if (failure){
		BuildDrop(fixSlots)
		closeInv()
	}

	let inventoryName = invName

	if (itemCount != 0){
		inventoryName = " Error grabbing item names."
	}

	for (i = 0; i < slotLimit+1; i++){

		if ( isEmpty(inventory[i]) ) {

		}else {

			let slot = inventory[i].slot;

			let itemid = ""+inventory[i].itemid+"";
			let itemcount = inventory[i].itemcount;
			let stackid = slot;

			inventoryName = inventory[slot].inventoryName

			let itemname = itemList[itemid].displayname;

			let weight = itemList[itemid].weight;
			let item_cost = itemList[itemid].price;

			let nonStack = itemList[itemid].nonStack;
			let image = itemList[itemid].image;

			let name = itemList[itemid].displayname;
			let meta = "This item containes no addition information";


			
			if (itemList[itemid].information){
				meta =  meta + "<br> "+ itemList[itemid].information;
			}else {
				if (itemList[itemid].craft){
					let requirements = itemList[itemid].craft;
					for (let xx = 0; xx < requirements.length; xx++){
						meta = meta + "<br>" + itemList[requirements[xx].itemid].displayname + ": " + requirements[xx].amount
					}
				}else {
					meta = "Ei lisättyjä tietoja"
				}
			}

			let stackString = "(nS)"
			if (nonStack) {
				nonStack = 1
			}else {
				nonStack = 0
				stackString = "(S)"
			}
			//inventory, weight, amount, name, inventoryName, currentSlot, metainformation, stackable, fwewef
			let htmlsting = "<div class='item-name'> " + name + " </div> <div class='information'>"+itemcount+ "("+weight+".00) </div> <img class='itemimage' src='icons/"+image+"' data-name='" +name+ "' data-inventory='"+inventoryNumber+"' data-currentslot='"+slot+"' data-metainformation='"+meta+"' data-inventoryname='"+inventoryName+"' data-weight='"+ weight +"'  data-fwewef='"+item_cost+"' data-meta='"+meta+"' data-stackable='"+nonStack+"' data-itemname='"+itemname+"' data-itemid='"+itemid+"' data-amount='"+itemcount+"'>";

			

			if (main){
				document.getElementById('playerslot'+slot).innerHTML = htmlsting;

				personalWeight = personalWeight + (weight * itemcount)
			}
		}
	}
	InventoryLog("Loaded " + inventoryName +" without recorded error.")
	UpdateSetWeights()
	clicking = true

}

function produceInfo(info) {
	let string = ""
	info = JSON.parse(info)
	let keys = Object.keys(info)

	for (let i = 0; i < keys.length; i++){
		string = string + keys[i] + ": " + info[keys[i]]
		if (i+1 < keys.length){
			string = string + " | "
		}
	}
	return string;
}

function DisplayInventory(sqlInventory,itemCount,invName,main) {
	clicking = false
	sqlInventory = JSON.parse(sqlInventory)
	let maxWeight = 250
	let slotLimit = 40

	let inventory = {}
	itemCount = parseInt(itemCount);

	if (main){
		PlayerInventoryName = invName;
		CreateEmptyPersonalSlot(slotLimit);
	}else {
		TargetInventoryName = invName;
		CreateEmptySecondarySlot(slotLimitTarget)
		slotLimit = slotLimitTarget
	}
	let slot = 0;
	InventoryLog(invName + ' is loading')


	let inventoryNumber = 1;
	if (!main){
		inventoryNumber = 2;
	}

	let failure = false;
	let fixSlots = {};

	for (let i = 0; i < itemCount; i++) {

		slot = sqlInventory[i].slot
		if ( isEmpty(inventory[slot]) ) {
			//Do something
			inventory[slot] = {}
			inventory[slot].slot = slot
			inventory[slot].itemid = sqlInventory[i].item_id
			inventory[slot].itemcount = 1
			inventory[slot].inventoryName = sqlInventory[i].name
			inventory[slot].information = produceInfo(sqlInventory[i].information) 
		}else {

			if (sqlInventory[i].item_id != inventory[slot].itemid){
				if (fixSlots[sqlInventory[i].item_id]){
					fixSlots[sqlInventory[i].item_id].push(sqlInventory[i].id)
				}else {
					fixSlots[sqlInventory[i].item_id] = []
					failure = true
					fixSlots[sqlInventory[i].item_id].push(sqlInventory[i].id)
				}
			}else {
				inventory[slot].itemcount = inventory[slot].itemcount + 1
			}
		}
	}

	if (failure){
		BuildDrop(fixSlots)
		closeInv()
	}

	let inventoryName = invName

	if (itemCount != 0){
		inventoryName = "Error grabbing item names."
	}

	for (i = 0; i < slotLimit+1; i++){

		if ( isEmpty(inventory[i]) ) {

		}else {

			let slot = inventory[i].slot;
			let itemid = ""+inventory[i].itemid+"";
			let itemcount = inventory[i].itemcount;
			let stackid = slot;

			inventoryName = inventory[slot].inventoryName

			let itemname = itemList[itemid].displayname;

			let weight = itemList[itemid].weight;
			let item_cost = itemList[itemid].price;

			let nonStack = itemList[itemid].nonStack;
			let image = itemList[itemid].image;

			let name = itemList[itemid].displayname;
			let meta = "This item containes no addition information";


			
			if (itemList[itemid].information){
				meta = itemList[itemid].information;
			}else {
				if (itemList[itemid].craft){
					let requirements = itemList[itemid].craft;
					for (let xx = 0; xx < requirements.length; xx++){
						meta = meta + "<br>" + itemList[requirements[xx].itemid].displayname + ": " + requirements[xx].amount
					}
				}else {
					meta = "Ei lisättyjä tietoja"
				}
			}

			let stackString = "(nS)"
			if (nonStack) {
				nonStack = 1
			}else {
				nonStack = 0
				stackString = "(S)"
			}
			//inventory, weight, amount, name, inventoryName, currentSlot, metainformation, stackable, fwewef
			let htmlsting = "<div class='item-name'> " + name + " </div> <div class='information'>"+itemcount+ "("+weight+".00) </div> <img class='itemimage' src='icons/"+image+"' data-name='" +name+ "' data-inventory='"+inventoryNumber+"' data-currentslot='"+slot+"' data-metainformation='"+meta+"' data-inventoryname='"+inventoryName+"' data-weight='"+ weight +"'  data-fwewef='"+item_cost+"' data-meta='"+meta+"' data-stackable='"+nonStack+"' data-itemname='"+itemname+"' data-itemid='"+itemid+"' data-amount='"+itemcount+"'>";

			if (TargetInventoryName == "Shop" && main === false){
				if(sqlInventory[i-1].amount === undefined) {
					itemcount = 10
				}else{
					itemcount = sqlInventory[i-1].amount
				}
				htmlsting = "<div class='item-name'> " + name + " - $"+item_cost+" </div> <div class='information'>"+itemcount+ "("+weight+".00) </div> <img class='itemimage' src='icons/"+image+"' data-name='" +name+ "' data-inventory='"+inventoryNumber+"' data-currentslot='"+slot+"' data-metainformation='"+meta+"' data-inventoryname='"+inventoryName+"' data-weight='"+ weight +"'  data-fwewef='"+item_cost+"' data-meta='"+meta+"' data-stackable='"+nonStack+"' data-itemname='"+itemname+"' data-itemid='"+itemid+"' data-amount='"+itemcount+"'>";
			}
			if (TargetInventoryName == "Craft" && main === false){
				if(sqlInventory[i-1].amount === undefined) {
					itemcount = 1
				}else{
					itemcount = sqlInventory[i-1].amount
				}
				htmlsting = "<div class='item-name'> " + name + " - crafteble </div> <div class='information'>"+itemcount+ "("+weight+".00) </div> <img class='itemimage' src='icons/"+image+"' data-name='" +name+ "'data-inventory='"+inventoryNumber+"' data-currentslot='"+slot+"' data-metainformation='"+meta+"' data-inventoryname='"+inventoryName+"' data-weight='"+ weight +"'  data-fwewef='"+item_cost+"' data-meta='"+meta+"' data-stackable='"+nonStack+"' data-itemname='"+itemname+"' data-itemid='"+itemid+"' data-amount='"+itemcount+"'>";
			}

			if (main){
				document.getElementById('playerslot'+slot).innerHTML = htmlsting;

				personalWeight = personalWeight + (weight * itemcount)
			}else{
				document.getElementById('secondaryslot'+slot).innerHTML = htmlsting;

				secondaryWeight = secondaryWeight + (weight * itemcount)
			}
		}
	}
	InventoryLog("Loaded " + inventoryName +" without recorded error.")
	UpdateSetWeights()
	clicking = true
}

function UpdateSetWeights() {
	document.getElementById('wrapPersonalWeight').innerHTML = "<h2>"+ PlayerInventoryName +" </h2> Paino: " + personalWeight.toFixed(2) + " / " + personalMaxWeight.toFixed(2);
	document.getElementById('wrapSecondaryWeight').innerHTML = "<h2>"+ TargetInventoryName +" </h2> Paino: " + secondaryWeight.toFixed(2) + " / " + secondaryMaxWeight.toFixed(2);

	let meth = personalWeight.toFixed(2)
	let sec = secondaryWeight.toFixed(2)
	$.post("http://inventory/Weight", JSON.stringify({ perweight: meth, secweight: sec }))
}


function startCSSDrag() {
	var draggeItemHtml = document.getElementById(draggingid).innerHTML;
	document.getElementById('draggedItem').innerHTML = draggeItemHtml;
	document.getElementById('draggedItem').style.left = 'cursorX-50';
	document.getElementById('draggedItem').style.top = 'cursorY-50';
	document.getElementById('draggedItem').style.opacity = '0.5';
}


function CreateEmptyPersonalSlot(slotLimit){
	for (i = 1; i < slotLimit+1; i++){
		let htmlsting = "<div id='playerslot" + i +"' class='item'> <div class='item-name'></div> </div>"

		if(i == 1 ){
			htmlsting = "<div id='playerslot" + i +"' class='item' ><div class='item-name'></div>  </div><div id='bind1'> 1 </div> "
		}
		if(i == 2 ){
			htmlsting = "<div id='playerslot" + i +"' class='item' ><div class='item-name'></div>  </div><div id='bind2'> 2 </div> "
		}
		if(i == 3 ){
			htmlsting = "<div id='playerslot" + i +"' class='item' ><div class='item-name'></div>  </div> <div id='bind3'> 3 </div>"
		}
		if(i == 4 ){
			htmlsting = "<div id='playerslot" + i +"' class='item' ><div class='item-name'></div>  </div> <div id='bind4'> 4 </div>"
		}
		document.getElementById('wrapmain').innerHTML += htmlsting;
	}
}

function CreateEmptySecondarySlot(slotLimit){
	let classColorName = "default";
	if (TargetInventoryName.indexOf("Hanskalokero") > -1){
		classColorName = "lblue";
	}else if (TargetInventoryName.indexOf("Takakontti") > -1){
		classColorName = "lblue";
	}else if (TargetInventoryName.indexOf("hidden") > -1){
		classColorName = "green";
	}else if (TargetInventoryName.indexOf("Pudota") > -1){
		classColorName = "red";
	}else {
		classColorName = "default";
	}

	for (i = 1; i < slotLimit+1; i++){
		let htmlsting = "<div id='secondaryslot" + i +"' class='item "+classColorName+"' ><div class='item-name'> </div> </div>"
		document.getElementById('wrapsecondary').innerHTML += htmlsting;
	}
}



function ErrorCheck(staringInventory,inventoryDropName,movementWeight) {
	var sameinventory = true;
	var ErrorReason = "Success"
	if (inventoryDropName == "wrapsecondary" && staringInventory == 1){
		sameinventory = false;
	}else if (inventoryDropName == "wrapmain" && staringInventory == 2){
		sameinventory = false;
	}

	if (sameinventory == true){
		if (staringInventory == 1){

		}else{

		}
	}else {
		if (staringInventory == 1){
			if (movementWeight + secondaryWeight > secondaryMaxWeight){
				ErrorReason = "You target weight is too much";
			}
		}else {
			if(movementWeight + personalWeight > personalMaxWeight){
				ErrorReason = "The personal weight is too much";
			}
		}
	}
	return ErrorReason
}




document.onmousedown = function (eventHandler, mEvent){
	var x = event.clientX, y = event.clientY
	element = document.elementFromPoint(x, y);

	if (element.id === "Logs" || element.id === "wrapPersonalWeight" || element.id === "wrapSecondaryWeight" || element.id === "wrapmain" || element.id === "wrapsecondary"){
		return;
	}
	if (element.id === "CloseInv"){
		closeInv()
		return;
	}else if (element.id === "Use"){
		useitem();
	}else if (element.id === "Drop"){
		if (draggingid != "none"){
			AttemptDropInEmptySlot(draggingid, true);
		}
	}
	var isImg = (element.nodeName.toLowerCase() == 'img');

	if ( isImg == true){
		element = element.parentNode.id;
		DisplayInformation(element);
		if (eventHandler.which === 3){
		}else {
			DragToggle(element);
		}
	}else {
		DragToggle(element.id);
	}
}

document.onmouseover = function (e){

	element = e.target;
	var isImg = (element.nodeName.toLowerCase() === 'img');

	if (isImg == true && !dragging){
		element = element.parentNode.id;
		DisplayInformation(element);
		document.getElementById('CurrentInformation').style.opacity = '1';
	}else{
		if(!dragging) {
			document.getElementById('CurrentInformation').style.opacity = '0';
		}
	}
};


function DragToggle(slot) {

	 if ( !clicking ) {
	 	return;
	}

	var moveAmount = parseInt(document.getElementById("move-amount").value);

	if (!moveAmount){
		if(TargetInventoryName == "Shop" || TargetInventoryName == "Craft"){
			document.getElementById("move-amount").value = 1;
			moveAmount = 1;
		}else{
			document.getElementById("move-amount").value = 0;
			moveAmount = 0;
		}
	}

	if ( slot ) {

		var c = document.getElementById(slot).children.length;

		var occupiedslot = false;
		if (c > 1){
			occupiedslot = true;
		}
		if (occupiedslot == true && dragging == false){
			dragging = true;
			draggingid = slot;

			$.post("http://inventory/SlotInUse", JSON.stringify(parseInt(draggingid.replace(/\D/g, ''))));

			startCSSDrag();
		}else if (occupiedslot == true && dragging == true){
			AttempDropInFilledSlot(slot);
		}else if (occupiedslot == false && dragging == true){
			$.post("http://inventory/SlotInUse", JSON.stringify(parseInt(draggingid.replace(/\D/g, ''))));

			AttemptDropInEmptySlot(slot,false);
		}else if (occupiedslot == false && dragging == false){

			dragging = false;
			draggingid = "none"; 
		}
	}
}


function CompileStacks(targetSlot,originSlot,inv1,inv2,originAmount,targetAmount,moveAmount,purchase,itemCosts,itemidsent,moveAmount){

	$.post("http://inventory/SlotJustUsed", JSON.stringify({targetslot: targetSlot, origin: originSlot, itemid: itemidsent, move: false}));

	if (inv2 == "wrapmain"){
		originInventory = PlayerInventoryName
	}else {
		originInventory = TargetInventoryName
	}

	if (inv1 == "wrapmain"){
		targetInventory = PlayerInventoryName
	}else {
		targetInventory = TargetInventoryName
	}
	invStack(targetSlot, moveAmount,targetInventory,originSlot,originInventory,purchase,itemCosts,itemidsent,moveAmount,crafting);

	InventoryLog("Changed Slot: " + targetSlot + "(" + targetAmount + ") Of " +inv2+ " to "+ originSlot + " ("+ originAmount + ") of "+ inv1 + " ")
	SuccessMove()
	if (crafting){
		closeInv();
	}
}

function MoveStack(targetSlot,originSlot,inv1,inv2,purchase,itemCosts,itemidsent,moveAmount){

	$.post("http://inventory/SlotJustUsed", JSON.stringify({targetslot: targetSlot, origin: originSlot, itemid: itemidsent, move: true}));

	if (inv2 == "wrapmain"){
		originInventory = PlayerInventoryName
	}else {
		originInventory = TargetInventoryName
	}

	if (inv1 == "wrapmain"){
		targetInventory = PlayerInventoryName
	}else {
		targetInventory = TargetInventoryName
	}
	invMove(targetSlot,originSlot,targetInventory,originInventory,purchase,itemCosts,itemidsent,moveAmount,crafting);
	InventoryLog("Moved Slot: " + targetSlot + " of " + targetInventory + " to " +originSlot+ " of "+ originInventory + " #"+ itemidsent);
	UpdateSetWeights()
	SuccessMove()

	if (crafting){
		closeInv();
	}
}

function DropItem(slot,amountDropped) {
	var item = document.getElementById(slot).getElementsByTagName('img')[0];
	currentInventory = item.dataset.inventory;
	weight = item.dataset.weight;
	amount = item.dataset.amount;

	name = item.dataset.name;
	itemid = item.dataset.itemid;
	inventoryUserName = item.dataset.inventoryname;
	slotusing = item.dataset.currentslot

	let inventoryDropNameText = "Secondary Inventory"
	if (currentInventory == 1){
		inventoryDropNameText = "Player Inventory"
	}
	
	InventoryLog("Dropped: " + name + " x("+ amountDropped + ") from slot " +slotusing + " of "+ inventoryUserName)
	SuccessMove()
}

function SwapStack(targetSlot,originSlot,inv1,inv2){

	$.post("http://inventory/SlotJustUsed", JSON.stringify({targetslot: targetSlot, origin: originSlot, itemid: itemid, move: false}));


	if (inv2 == "wrapmain"){
		originInventory = PlayerInventoryName
	}else {
		originInventory = TargetInventoryName
	}

	if (inv1 == "wrapmain"){
		targetInventory = PlayerInventoryName
	}else {
		targetInventory = TargetInventoryName
	}
	invSwap(targetSlot,targetInventory,originSlot,originInventory);

	InventoryLog("Swapped Slot: " + targetSlot + " of " + targetInventory + " and " +originSlot+ " of "+ originInventory + " " );
	UpdateSetWeights()
	SuccessMove()

}

function CleanEndDrag() {
	$('draggedItem').css('opacity',0.0);
	document.getElementById('draggedItem').innerHTML = "";
	dragging = false;
	draggingid = "none";
}

function DisplayDataSet(slot) {
	var item = document.getElementById(slot).getElementsByTagName('img')[0];
}

function closeInv(){
	personalWeight = 0;
	secondaryWeight = 0;
	$.post("http://inventory/ServerCloseInventory", JSON.stringify({target: TargetInventoryName}) );
	$.post("http://inventory/Close");
}

function ErrorMove(){
	$.post("http://inventory/ErrorMove");
}

function SuccessMove(){
	$.post("http://inventory/SuccessMove");
}

function CountItems(ItemIdToCheck) {
	var sqlInventory = myInventory;
	var maxWeight = 100
	var slotLimit = 20
	var itemCount = parseInt(MyItemCount);
	var totalItemAmount = 0;


	var slot = 0;
	for (i = 0; i < itemCount; i++) {
		if (sqlInventory[i].item_id == ItemIdToCheck){
			totalItemAmount ++;
		}
	}
	return totalItemAmount;
}

function RequestItemData(){
	var item = document.getElementById(draggingid).getElementsByTagName('img')[0];
	currentInventory = item.dataset.inventory;
	weight = item.dataset.weight;
	amount = item.dataset.amount;
	name = item.dataset.name;
	itemid = item.dataset.itemid;
	inventoryUsedName = item.dataset.inventoryname;
	slotusing = item.dataset.currentslot;
}



function DisplayInformation(slot){
	var item = document.getElementById(slot).getElementsByTagName('img')[0];

	var weight = parseInt(item.dataset.weight);
	var amount = parseInt(item.dataset.amount);

	var name = item.dataset.name;
	var metainformation = item.dataset.metainformation;
	var stackable = parseInt(item.dataset.stackable);
	var amount = parseInt(item.dataset.amount);
	var weight = parseInt(item.dataset.weight);

	document.getElementById('CurrentInformation').innerHTML = "";

	document.getElementById('CurrentInformation').innerHTML = "<h2>" + name + "</h2> <div class='DispInfo'>" + metainformation + "</div> <br><hr><br><b>Paino</b>: " + weight.toFixed(2) + "<br><b>Määrä</b>: " + amount + "";
}

function AttempDropInFilledSlot(slot){
	var moveAmount = document.getElementById("move-amount").value;
	if(draggingid == slot){
		EndDragError(slot);
		ErrorMove()
		return;
	}
	
	var item = document.getElementById(draggingid).getElementsByTagName("img")[0];
	var itemReturnItem = document.getElementById(slot).getElementsByTagName("img")[0];
	let itemidsent = item.dataset.itemid;

	var currentInventory = parseInt(item.dataset.inventory);
	var weight = parseInt(item.dataset.weight);
	var amount = parseInt(item.dataset.amount);
	var name = item.dataset.name;
	var itemid1 = item.dataset.itemid;
	var stackable = parseInt(item.dataset.stackable);

	var itemid2 = itemReturnItem.dataset.itemid;
	var returnItemInventory = itemReturnItem.dataset.inventory;
	var weightReturnItem = parseInt(itemReturnItem.dataset.weight);
	var amountReturnItem = parseInt(itemReturnItem.dataset.amount);
	var nameReturnItem = itemReturnItem.dataset.name;
	var inventoryDropName = document.getElementById(slot).parentElement.className;
	var inventoryReturnItemDropName = document.getElementById(draggingid).parentElement.className;

	var sameinventory = true;
	purchase = false;
	crafting = false;
	var movementWeight = weight * amount;
	var movementReturnWeight = weightReturnItem * amountReturnItem;

	var stacking = false;
	var fullstack = false;

	if (itemid1 == itemid2 && !stackable){
		if (moveAmount == 0){
			fullstack = true;
			moveAmount = amount;
		}
		movementWeight = weight * moveAmount;
		movementReturnWeight = weightReturnItem * moveAmount;
		stacking = true;

	}

	var result = ErrorCheck(currentInventory,inventoryDropName,movementWeight)
	if (stacking == false){
		var result2 = ErrorCheck(returnItemInventory,inventoryReturnItemDropName,movementReturnWeight)
	}else {
		var result2 = "Success"
	}

	if(stacking && moveAmount > amount){
		document.getElementById("move-amount").value = 0;
		result2 = "Warning"
		result = "You dont have that amount!"
		ErrorMove()
	}

	if(inventoryDropName == "wrapsecondary" && TargetInventoryName == "Shop"){
		result = "You can not drop item into shop!"
		ErrorMove()
	}
	if (TargetInventoryName == "Craft"){
		result = "You can not drop item into crafting table!"
		ErrorMove()
	}

	if(result == "Success" && result2 == "Success"){

		if (currentInventory == 1 && inventoryDropName == "wrapsecondary"){
			item.dataset.inventory = 2;
			itemReturnItem.dataset.inventory = 1;
			if (stacking){
				personalWeight = personalWeight - movementWeight;
				secondaryWeight = secondaryWeight + movementWeight;
			}else{
				personalWeight = personalWeight + movementWeight - movementReturnWeight;
				secondaryWeight = secondaryWeight + movementReturnWeight - movementWeight;
			}
		}

		if (currentInventory == 2 && inventoryDropName == "wrapmain"){
			item.dataset.inventory = 1;
			itemReturnItem.dataset.inventory = 2;
			if (stacking){
				personalWeight = personalWeight + movementWeight;
				secondaryWeight = secondaryWeight - movementWeight;
			}else{
				personalWeight = personalWeight + movementWeight - movementReturnWeight;
				secondaryWeight = secondaryWeight + movementReturnWeight - movementWeight;
			}
		}

		if (stacking == true ){
			var purchaseCost = parseInt(item.dataset.fwewef) * parseInt(moveAmount);
			if (inventoryDropName == "wrapmain") {
				itemReturnItem.dataset.inventory = 1;
			}else {
				itemReturnItem.dataset.inventory = 2;
			}

			if (currentInventory == 1){
				item.dataset.inventory = 1;
			}else {
				item.dataset.inventory = 2;
			}

			var newAmount = parseInt(amountReturnItem) + parseInt(moveAmount);
			itemReturnItem.dataset.amount = newAmount;
			
			item.dataset.currentslot = parseInt(item.dataset.fwewed) * parseInt(moveAmount);

			InventoryLog(item.dataset.fwewef + " | " + purchaseCost + " | " +moveAmount) 

			if (TargetInventoryName == "Shop"){
				InventoryLog("eh: Purchase")
				if(purchaseCost > userCash) {
					result = "You cant afford this."
					EndDragError(slot);
					ErrorMove()
					InventoryLog('Error:' + result2 + " | " + result)
				}else {
					if (currentInventory == 2 && inventoryDropName == "wrapmain"){
						userCash = userCash - purchaseCost;
						InventoryLog('Ostit: $' + purchaseCost + " Sinulla $" + userCash + ".")
					}
				}
			}

			if (fullstack == false){
				var newAmount2 = parseInt(amount) - parseInt(moveAmount);
				item.dataset.amount = newAmount2;
				if (newAmount2 == 0){
					document.getElementById(draggingid).innerHTML = "";
				}
				CompileStacks(parseInt(slot.replace(/\D/g,'')), parseInt(draggingid.replace(/\D/g,'')), inventoryDropName,inventoryReturnItemDropName,newAmount,newAmount2,moveAmount,purchase,purchaseCost,itemidsent,moveAmount)

			}else {
				document.getElementById(draggingid).innerHTML = "";
				CompileStacks(parseInt(slot.replace(/\D/g,'')), parseInt(draggingid.replace(/\D/g,'')), inventoryDropName,inventoryReturnItemDropName,newAmount,0,moveAmount,purchase,purchaseCost,itemidsent,moveAmount)
			}
		}else {
			if (TargetInventoryName == "Shop" || TargetInventoryName == "Craft") {
				result = "Et voi Siirtää tavaraa kauppaan"
				EndDragError(slot);
				ErrorMove()
				InventoryLog('Error: ' + result2 + " | " +result)
			}else {
				SwapStack(parseInt(slot.replace(/\D/g,'')), parseInt(draggingid.replace(/\D/g,'')), inventoryDropName,inventoryReturnItemDropName)

				item.dataset.currentslot = parseInt(slot.replace(/\D/g,''));
				itemReturnItem.dataset.currentslot = parseInt(draggingid.replace(/\D/g,''));

				var currentdragHTML = document.getElementById(draggingid).innerHTML;
				var currentdropHTML = document.getElementById(slot).innerHTML;

				document.getElementById(draggingid).innerHTML = currentdropHTML;
				document.getElementById(slot).innerHTML = currentdragHTML;
			}
		}
		UpdateSetWeights()

		EndDrag(slot);
	}else {
		EndDragError(slot);
		ErrorMove()
		InventoryLog('Error: ' + result2 + " | " +result)
	}

}

function EndDragError(slot){
	UpdateTextInformation(draggingid);
	UpdateTextInformation(slot);

	document.getElementById('draggedItem').style.opacity = "0.0"
	document.getElementById('draggedItem').innerHTML = "";

	dragging = false;
	draggingid = "none";
}

function EndDrag(slot) {
	UpdateTextInformation(draggingid);
	UpdateTextInformation(slot);

	dragging = false;
	draggingid = "none";
	document.getElementById('draggedItem').style.opacity = "0.0";
	document.getElementById('draggedItem').innerHTML = "";
}

function UpdateTextInformation(slot) {
	if (document.getElementById(slot) ){
		var item = document.getElementById(slot).getElementsByTagName('img')[0];
		if (item){
			var informationDiv = document.getElementById(slot).getElementsByTagName('div')[1];
			var weight = parseInt(item.dataset.weight); 
			var amount = parseInt(item.dataset.amount);
			var stackable = parseInt(item.dataset.stackable);

			if (parseInt(stackable) == 0){
				stackable = "(S)"
			}  else{
				stackable = "(nS)"
			}
			informationDiv.innerHTML = amount + " (" +weight+ ".00)";
		}
	}
}

function AttemptDropInEmptySlot(slot,isDropped){

	let item = document.getElementById(draggingid).getElementsByTagName('img')[0];
	let currentInventory = item.dataset.inventory;
	let weight = parseInt(item.dataset.weight);
	let amount = parseInt(item.dataset.amount);
	let inventoryReturnItemDropName = document.getElementById(draggingid).parentElement.className;
	let inventoryDropName = document.getElementById(slot).parentElement.className;
	let sameinventory = true;
	let movementWeight = weight * amount;
	purchase = false;
	crafting = false;
	let itemidsend = item.dataset.itemid;

	let moveAmount = parseInt(document.getElementById('move-amount').value);

	let splitMove = false;
	if (moveAmount != 0 && moveAmount != amount){
		splitMove = true;
		let alteredAmount = moveAmount;
		movementWeight = weight * alteredAmount;
	}
	if ( moveAmount == amount){
		splitMove = false
	}

	var result = ErrorCheck(currentInventory,inventoryDropName,movementWeight)

	if( isDropped && inventoryReturnItemDropName == "wrapsecondary"){
		result = "Error: can not drop a dropped item"
	}
	if (inventoryDropName == "wrapsecondary" && TargetInventoryName == "Shop"){
		result = "You cannot drop item into the shop";
	}

	if (inventoryDropName == "wrapsecondary" && TargetInventoryName == "Craft"){
		result = "You cannot drop item into the craft shop";
	}

	if (moveAmount > amount){
		document.getElementById('move-amount').value = 0;
		result = "You do not have that amount";
	}

	if (result == "Success"){

		if (currentInventory == 1 && (inventoryDropName == "wrapsecondary" || isDropped) ){

			personalWeight = personalWeight - movementWeight
			if (!isDropped){
				item.dataset.inventory = 2;
				secondaryWeight = secondaryWeight + movementWeight
			}
		}

		if (currentInventory == 2 && (inventoryDropName == "wrapmain" || isDropped) ){
			secondaryWeight = secondaryWeight - movementWeight
			if (!isDropped){
				item.dataset.inventory = 1;
				personalWeight = personalWeight + movementWeight
			}
			
		}

		UpdateSetWeights()

		let purchaseCost = parseInt(item.dataset.fwewef) * parseInt(moveAmount);
		InventoryLog(item.dataset.fwewef + " | " + purchaseCost + " | "+ moveAmount);
		if (TargetInventoryName == "Shop") {
			InventoryLog("eh: Purhcase")
			if(purchaseCost > userCash){
				result = "You can not drop items into the shop!"
				EndDragError(slot);
				InventoryLog("Error: " +result2 + " | " + result);
				userCash = userCash - purchaseCost;
			}else {
				if(currentInventory == 2 && inventoryDropName == "wrapmain"){
					userCash = userCash -purchaseCost;
					InventoryLog("Purhcase Cost $" +purchaseCost + " you have $" + userCash)
					purchase = true;
				}
			}
		}

		if (splitMove){

			if (!isDropped){
				document.getElementById(slot).innerHTML = document.getElementById(draggingid).innerHTML;
			}

			var itemNewItem = document.getElementById(slot).getElementsByTagName('img')[0];
			var startAmount = parseInt(item.dataset.amount);
				
			itemNewItem.dataset.amount = parseInt(moveAmount);

			if (inventoryDropName == "wrapsecondary"){
				itemNewItem.dataset.inventory = 2;
			}else{
				itemNewItem.dataset.inventory = 1;
			}

			item.dataset.amount = startAmount - parseInt(moveAmount);
			itemNewItem.dataset.currentslot = parseInt(slot.replace(/\D/g,''));

			var oldDragid = draggingid;

			if (!isDropped){
				CompileStacks(parseInt(slot.replace(/\D/g,'')), parseInt(oldDragid.replace(/\D/g,'')), inventoryDropName,inventoryReturnItemDropName,moveAmount,item.dataset.amount,moveAmount,purchase,purchaseCost,itemidsend,moveAmount)

				EndDrag(slot);
			}else{
				DropItem(oldDragid, moveAmount);
			}

			if (parseInt(item.dataset.amount) < 1){
				document.getElementById(oldDragid).innerHTML = "";
			}

			if(!isDropped){
				item.dataset.inventory = currentInventory;
			}
			EndDrag(oldDragid);
		}else{
			var oldDragid = draggingid;
			if (!isDropped){
				if (slot.replace(/\D/g,'') > 0){
					MoveStack(parseInt(slot.replace(/\D/g,'')), parseInt(oldDragid.replace(/\D/g,'')), inventoryDropName,inventoryReturnItemDropName,purchase,purchaseCost,itemidsend,moveAmount)

					if (inventoryDropName == "wrapsecondary"){
						item.dataset.inventory = 2;
					}else{
						item.dataset.inventory = 1;
					}
	
					item.dataset.currentslot = parseInt(slot.replace(/\D/g,''));
					document.getElementById(slot).innerHTML = document.getElementById(draggingid).innerHTML;
					EndDrag(slot);
				}else {
					EndDrag(slot);
					closeInv(TargetInventoryName);
				}
			}else {

				item.dataset.amount = 0;
				DropItem(draggingid, amount);
				EndDrag(slot); 
			} 
			document.getElementById(oldDragid).innerHTML = '<div class="item-name"></div>';
		}	
		
	}else {
		if (isDropped){
			CleanEndDrag()
			InventoryLog("Error: " + result)
		}else {
			EndDragError(slot);

			InventoryLog("Error: " + result)
		}
	}
}

function EndDragUsage(type){
	EndDrag(slot);
	var slot = type;

	dragging = false;
	draggingid = "none";

	$('#draggedItem').css('opacity', 0.0);
	document.getElementById('draggedItem').innerHTML = "";
}

function useitem(){
	if (dragging != false){
		RequestItemData()
		let isWeapon = itemList[itemid].weapon;

		if ( isWeapon === undefined) {
			isWeapon = false;
		}
		
		console.log("invuse")
		$.post("http://inventory/InvUse2", JSON.stringify({invName: inventoryUsedName,ItemId: itemid,SlotUsing: slotusing,IsWeapon: isWeapon}) );
		//$.post('http://inventory/InvUse', JSON.stringify({inventoryUsedName: inventoryUsedName,itemid: itemid,slotusing: slotusing,isWeapon: isWeapon}) );
		
		InventoryLog("Using item: "+name+"("+amount+") from " + inventoryUsedName +" | slot " + slotusing)
		EndDrag(slotusing);
		closeInv(TargetInventoryName);
	}
}

$(document).ready(function(){
	$("#search-text").on("keyup", function() {
		var value = $(this).val().toLowerCase();
		$("#wrapmain *").filter(function() {
			$(this).children().toggle($(this).text().toLowerCase().indexOf(value) > -1)
		});
	});
  });