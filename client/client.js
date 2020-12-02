
// exports['inventory']:GivePlyItem(water, 20)
// exports['inventory']:RemovePlyItem(water, 20) 
// exports['inventory']:CountItemsInventory(water) käytä vaikka local itemamount = exports['inventory']:CountItemsInventory(water) pienin mahdollinen returni on `0`
// exports['inventory']:OpenOtherPlayerInv(1) `1` on pelaajan session id eli server id


let canOpen = true;
let dropName = "none";
let DroppedInventories = [];
let NearInventories = [];
let DrawInventories = [];
let MyInventory = [];
let MyItemCount = 0;
let cash = 0;
let openedInv = false;
let cid;
let uid;
let hexid;
let name;
let rank;
let job;
let slotAvailable = [ ...Array(41).keys()].splice(1)
let boundItems = {}
let ammoTable = {}
let boundItemsAmmo = {}
let usedSlots = []
let timer = 0;
let timeFunction = false;


let objectDumps = [
	{objectID: 666561306, Description: "Blue Dumpster"},
	{objectID: 218085040, Description: "Light Blue Dumpster"},
	{objectID: -58485588, Description: "Grey Dumpster"},
	{objectID: 682791951, Description: "Big Blue Dumpster"},
	{objectID: -206690185, Description: "Big Green Dumpster"},
	{objectID: 364445978, Description: "Big Green Skip Bin"},
	{objectID: 143369, Description: "Small Bin"},
]


function ScanContainers()  {
	let player = GetPlayerPed();
	let startPosition = GetOffsetFromEntityInWorldCoords(player, 0, 0.1, 0);
	let endPosition = GetOffsetFromEntityInWorldCoords(player, 0, 1.8, -0.4);
	
	let rayhandle = StartShapeTestRay(startPosition[0], startPosition[1], startPosition[2], endPosition[0], endPosition[1], endPosition[2], 16, player, 0)

	let vehicleInfo = GetShapeTestResult(rayhandle)

	let hitData = vehicleInfo[4]

	let model = 0;
	let entity = 0;
	if (hitData){
		model = GetEntityModel(hitData);
	}
	if (model !== 0){
		for (let x in objectDumps) {
			if (x) {
				if (objectDumps[x].objectID == model){
					return GetEntityCoords(hitData);
				}
			}
		}
	}
}

function getQuantity ( ItemIdToCheck ) {
	var sqlInventory = JSON.parse(MyInventory);
	var itemCount = parseInt(MyItemCount);
	var totalItemAmount = 0;
	for (var i = 0; i < itemCount; i++) {
		if (sqlInventory[i].item_id == ItemIdToCheck){
			totalItemAmount++;
		}
	}
	return totalItemAmount;
}



RegisterNuiCallbackType("Weight");
on("__cfx_nui:Weight", (data, cb) => {

})
RegisterNuiCallbackType("Close");
on("__cfx_nui:Close", (data, cb) => {
	CloseGui()
})

RegisterNuiCallbackType("SuccessMove");
on("__cfx_nui:SuccessMove", (data, cb) => {
	PlaySoundFrontend(-1, "ERROR", "HUD_LIQUOR_STORE_SOUNDSET", false)
})

RegisterNuiCallbackType("ErrorMove");
on("__cfx_nui:ErrorMove", (data, cb) => {
	PlaySoundFrontend(-1, "ERROR", "HUD_FRONTEND_DEFAULT_SOUNDSET", false)
})

RegisterNuiCallbackType("SlotInUse");
on("__cfx_nui:SlotInUse", (data, cb) => {
    //console.log("SlotInUse = "+data);
    TriggerEvent("inv:ReWeapon")
})

RegisterNuiCallbackType("ServerCloseInventory");
on("__cfx_nui:ServerCloseInventory", (data, cb) => {
	let cid = exports["framework"].isPed("cid")
	emitNet("server-inventory-close", cid, data.target)
})

RegisterNuiCallbackType("stack");
on("__cfx_nui:stack", (data, cb) => {
	let cid = exports["framework"].isPed("cid")
	emitNet("server-inventory-stack", cid, data, GetEntityCoords(GetPlayerPed()))
})

RegisterNuiCallbackType("move");
on("__cfx_nui:move", (data, cb) => {
	let cid = exports["framework"].isPed("cid")
	emitNet("server-inventory-move", cid, data, GetEntityCoords(GetPlayerPed()))
})

RegisterNuiCallbackType("swap");
on("__cfx_nui:swap", (data, cb) => {
	let cid = exports["framework"].isPed("cid")
	emitNet("server-inventory-swap", cid, data, GetEntityCoords(GetPlayerPed()))
})


RegisterNuiCallbackType("removeCraftItems");
on("__cfx_nui:removeCraftItems", (data, cb) => {
	let cid = exports["framework"].isPed("cid")
	emitNet("server-inventory-removeCraftItems", cid, data, GetEntityCoords(GetPlayerPed()))
})

RegisterNuiCallbackType("dropIncorrectItems");
on("__cfx_nui:dropIncorrectItems", (data, cb) => {
	
	if (!canOpen){
		return;
	}
	canOpen = false;
	let items = data.items;

	let keys = Object.keys(items)

	let itemArrey = [];
	let i = 1;
	for (let key in items) {
		itemArrey.push({item_id: items[key], slot: i})
		i = i + 1
	}

	let cid = exports["framework"].isPed("cid")
	emitNet("server-inventory-open", GetEntityCoords(GetPlayerPed()), cid, "13", "Pudota", itemArrey);

	setTimeout(() => {canOpen = true}, 1000)

})


let recentused = [];
RegisterNuiCallbackType("SlotJustUsed");
on("__cfx_nui:SlotJustUsed", (data, cb) => {

	let target = data.targetslot;
	if (target < 5) {
		Rebind(target, data.itemid)
		
	}
	if (data.move){
		boundItems[data.origin] = undefined
	}
	
	recentused.push(data.origin)
	recentused.push(data.targetslot)
	usedSlots = []
	
})

function doubleCheck(slotCheck) {
	let foundshit = recentused.find(x => x == slotcheck)
	if (foundshit) {
		return false
	}else {
		return true
	}
}

RegisterNetEvent('inventory-open-request')
on('inventory-open-request', () => {
	let player = GetPlayerPed();
	let startPosition = GetOffsetFromEntityInWorldCoords(player, 0, 0.5, 0);
	let endPosition = GetOffsetFromEntityInWorldCoords(player, 0, 2.0, -0.4)

	let cid = exports["framework"].isPed("cid")

	let nearDrop = false;
	let nearSales = false;
	let nearTarget = false;
	// let BinFound = ScanContainers();
	let targetid = 0
	cash = 5000
	OpenGui()


	let rayhandle = StartShapeTestRay(startPosition[0], startPosition[1], startPosition[2], endPosition[0], endPosition[1], endPosition[2], 10, player, 0)
	let VehicleInfo = GetShapeTestResult(rayhandle)
	let vehicleFound = VehicleInfo[4]

	
	let isInVehicle = IsPedInAnyVehicle(GetPlayerPed(), false);

	if (isInVehicle){

		let vehicleFound = GetVehiclePedIsIn(GetPlayerPed(), false);
		let licensePlate = GetVehicleNumberPlateText(vehicleFound);

		emitNet("server-inventory-open", startPosition, cid, "1","Hanskalokero-" + licensePlate);
	// }else if (BinFound){
	// 	console.log("JOTIN")
	// 	let x = startPosition[0].toFixed(2)
	// 	let y = startPosition[1].toFixed(2)
	// 	let container = "hidden-container | "+x +"|"+y
	// 	emitNet("server-inventory-open", startPosition, cid, "1", container);
	}else if (vehicleFound != 0){

		var cock = GetEntityModel(vehicleFound);
		var coords = GetModelDimensions(cock);
	
		var back = GetOffsetFromEntityInWorldCoords(vehicleFound, 0.0, coords[0][1] - 0.5, 0.0);
		var distanceRear = GetDistanceBetweenCoords(startPosition[0], startPosition[1], startPosition[2], back[0], back[1], back[2]);


		if (GetVehicleDoorLockStatus() == 2 && distanceRear < 1.5){
			console.log("Locked")
			CloseGui()
		}else {

			if (distanceRear > 1.5){
				GroundinventoryScan()
			}else {
				let licensePlate = GetVehicleNumberPlateText(vehicleFound);
				emitNet("server-inventory-open", startPosition, cid, "1", "Takakontti-" + licensePlate);
			}
		}
	} else {
		GroundinventoryScan()
	}
	
})

function ResetCache(fullReset) {
	CacheBinds(JSON.parse(MyInventory))
	let sqlInventory = JSON.parse(MyInventory);
	let itemCount = parseInt(MyItemCount);

	slotAvailable = [ ...Array(41).keys()].splice(1)

	if (fullReset){
		usedSlots = []
	}
}

function Rebind(slot, itemid) {
	let Ped = GetPlayerPed()
	boundItems[slot] = itemid
	if (!isNaN(boundItems[slot])) {
		let ammoType = Citizen.invokeNative("0x7FEAD38B326B9F74", GetPlayerPed(), parseInt(boundItems[slot]), Citizen.returnResultAnyway(), Citizen.resultAsInteger())
		if( ammoTable[""+ammoType+""]){
			boundItemsAmmo[slot] = ammoTable[""+ammoType+""].ammo
		}else {
			boundItemsAmmo[slot] = 0
		}
	}else {
		boundItemsAmmo[slot] = undefined
	}
}


RegisterNetEvent("inventory-bind")
on("inventory-bind", slot => {
	let cid = exports["framework"].isPed("cid")
	let inventoryUsedName = 'ply-' + cid
	let itemid = boundItems[slot]

	let isWepaon = true

	if (isNaN(itemid)){
		isWepaon = false;
		emit("RunUseItem", itemid, slot, inventoryUsedName, isWepaon)
	}else {
		emit("RunUseItem", parseInt(itemid), slot, inventoryUsedName, isWepaon)
	}
})



function CacheBinds(sqlInventory) {
	 boundItems = {}
	 let Ped = GetPlayerPed()
	 for (let i = 0; i < itemCount; i++){
	 	let slot = sqlInventory[i].slot
	 	if (slot < 5 ) {
	 		boundItems[slot] = sqlInventory[i].item_id
	 		if (!isNaN(boundItems[slot])) {
				let ammoType = Citizen.invokeNative("0x7FEAD38B326B9F74", GetPlayerPed(), parseInt(boundItems[slot]), Citizen.returnResultAnyway(), Citizen.resultAsInteger())
				if( ammoTable[""+ammoType+""]){
					boundItemsAmmo[slot] = ammoTable[""+ammoType+""].ammo
				}else {
					boundItemsAmmo[slot] = 0
				}
			}else {
				boundItemsAmmo[slot] = undefined
	 		}
	 	}
	}
}

function findSlot (ItemIdToCheck, amount, nonStacking){

	let sqlInventory = JSON.parse(MyInventory);

	let itemCount = parseInt(MyItemCount);
	let foundslot = 0;

	for (let i = 0; i < itemCount; i++) {
		if ((sqlInventory[i].item_id == ItemIdToCheck ) && nonStacking == false){
			if (doubleCheck(sqlInventory[i].slot)) {
				foundslot = sqlInventory[i].slot
			}
		}
	}
	
	if (usedSlots[ItemIdToCheck] && nonStacking == false){
		
		foundslot = usedSlots[ItemIdToCheck];
		slotAvailable = slotAvailable.filter(x => x != foundslot)
	}

	for (let i = 0; i < itemCount; i++){
		slotAvailable = slotAvailable.filter(x => x != sqlInventory[i].slot)
	}

	if (foundslot == 0 && slotAvailable[0] != undefined && slotAvailable.length > 0){
		foundslot = slotAvailable[0];
		usedSlots[ItemIdToCheck] = foundslot;
		slotAvailable = slotAvailable.filter(x => x != foundslot);
	}

	return foundslot
}

function GroundinventoryScan() {
	let row = DroppedInventories.find(ScanClose); 
	let cid = exports["framework"].isPed("cid")
	if(row){
		emitNet("server-inventory-open", GetEntityCoords(GetPlayerPed()), cid, "1", row.name);
	}else {

		emitNet("server-inventory-open", GetEntityCoords(GetPlayerPed()), cid, "3", "create");
	}
}

function ScanClose(row) {
	let playerPos = GetEntityCoords(GetPlayerPed());
	let targetPos = row.position;
	let distancec = GetDistanceBetweenCoords(playerPos[0], playerPos[1], playerPos[2], targetPos.x, targetPos.y,targetPos.z);
	return distancec < 1.5;
}

function removeNum(numbers) {
	return numbers != sql.Inventory[i].slot;
}

function ClearCache(sentIndexName) {
	var foundindex = -1;
	let i = 0;
	for (let Row in DroppedInventories){
		if (DroppedInventories[Row].name == sentIndexName){
			foundindex = i;
			break;
		}
		i++
	}
	if (foundindex > -1){
		DroppedInventories.splice(foundindex, 1);
	}

	foundindex = -1;
	i = 0;
	for (let Row in DrawInventories){
		if (DrawInventories[Row].name == sentIndexName){
			foundindex = i;
			break;
		}
		i++
	}
	if ( foundindex > -1){

		DrawInventories.splice(foundindex, 1);
	}
	foundindex = -1;
	i = 0;
	for (let Row in NearInventories){
		if (NearInventories[Row].name == sentIndexName){
			foundindex = i;
			break;
		}
		i++

	}
	if ( foundindex > -1){

		NearInventories.splice(foundindex, 1);
	}
}

RegisterNetEvent('server-inventory-open')
on('server-inventory-open', (target, name) =>{
	let cid = exports["framework"].isPed("cid")

	emitNet("server-inventory-open", GetEntityCoords(GetPlayerPed()), cid, target, name)
})


RegisterNetEvent('client-inventory-swap')
on('client-inventory-swap', (targetSlot,targetInvetory,originSlot,origininventory) => {
	emitNet("server-inventory-swap", targetSlot,targetInvetory,originSlot,origininventory)
});

RegisterNetEvent('client-inventory-remove-any')
on('client-inventory-remove-any', (itemidsent, amount) => {
	let cid = exports["framework"].isPed("cid")
	emitNet("server-inventory-remove-any", itemidsent,amount, cid)
})

RegisterNetEvent('client-inventory-remove-slot')
on('client-inventory-remove-slot', slot => {
	let cid = exports["framework"].isPed("cid")
	emitNet("server-inventory-remove-slot", cid, slot)
})

RegisterNetEvent('Inventory-Dropped-Remove')
on('Inventory-Dropped-Remove', sendIndexName => {
	ClearCache(sendIndexName);
})

RegisterNetEvent('inventory-update-player-inventory')
on('inventory-update-player-inventory', MyInv => {
	MyInventory = MyInv[0]
	MyItemCount = MyInv[1]
	emit("current-items", JSON.parse(MyInventory));
})

RegisterNetEvent('inventory-update-player')
on('inventory-update-player', information => {
	playerinventory = information[0]
	itemCount = information[1]
	invName = information[2]
	MyInventory = playerinventory
	MyItemCount = itemCount

	if (openedInv){

		ResetCache(false)
		PopulateGuiSingle(playerinventory, itemCount, invName);
		SendNuiMessage( JSON.stringify({ response: "EnableMouse" }))

		SendNuiMessage( JSON.stringify({ response: "toggleDebug", debug: false }))
	}
	
	ResetCache(false)
	emit("current-items", JSON.parse(MyInventory));
})


RegisterNetEvent('Inventory-Dropped-Addition')
on('Inventory-Dropped-Addition', object => {

	DroppedInventories.push(object)
	NearInventories.push(object)
	DrawInventories.push(object)
})

RegisterNetEvent('inventory-open-player')
on('inventory-open-player', (playerinventory, itemCount, invName) =>{
	if (canOpen === true){
		MyInventory = playerinventory;
		MyItemCount = itemCount;
		OpenGui()
		PopulateGuiSingle(playerinventory, itemCount,invName,cash);
	}
	emit("current-items", JSON.parse(playerinventory));
});

RegisterNetEvent('inventory-open-target')
on('inventory-open-target', information =>{

	playerinventory = information[0]
	itemCount = information[1] 
	invName = information[2] 
	targetinventory = information[3]
	targetitemCount = information[4]
	targetinvName = information[5]

	if (canOpen === true){
		MyInventory = playerinventory;
		MyItemCount = itemCount;

		ResetCache(true)
		OpenGui()
		PopulateGui(playerinventory, itemCount,invName, targetinventory, targetitemCount, targetinvName ,cash);
		SendNuiMessage( JSON.stringify({ response: "EnableMouse" }))
	}
	emit("current-items", JSON.parse(playerinventory));
});

function OpenOtherPlayerInv(serverid) {
	let data = "12"
	let plyinv = 'ply-' + data.replace(/steam:/g, "")
	emit("server-inventory-open", serverid, 1, plyinv)
}

function removeItem(id, amount) {
	let cid = exports["framework"].isPed("cid")
	emit("hud-display-item", itemid, "Poistettu")

	emitNet("server-remove-item", cid, id, amount, openedInv)

	emitNet("server-request-update", cid)
}

function CloseGui() {
	SetCinematicModeActive(false)
	SendNuiMessage( JSON.stringify({ response: "CloseGui"}));
	SetNuiFocus(false,false)
	openedInv = false
	recentused = []
};

function OpenGui() {
	if (openedInv === true){
		return;
	}
	SetCinematicModeActive(true)
	openedInv = true
	SendNuiMessage( JSON.stringify({ response: "OpenGui"}));
	SetNuiFocus(true,true)
};

function PopulateGuiSingle(playerinventory,itemCount,invName) {
	SendNuiMessage( JSON.stringify({ response: "PopulateSingle", playerinventory: playerinventory, itemCount: itemCount, invName: invName}))
};

function PopulateGui(playerinventory,itemCount,invName,targetinventory,targetitemCount,targetinvName,cash) {
	SendNuiMessage( JSON.stringify({ response: "Populate", playerinventory: playerinventory, itemCount: itemCount, invName: invName, targetinventory: targetinventory, targetitemCount: targetitemCount, targetinvName: targetinvName, cash: cash}))
};

RegisterNetEvent('inventory-open-target-NoInject')
on('inventory-open-target-NoInject', (playerinventory, itemCount, invName) => {
	if (canOpen === true){
		MyInventory = playerinventory;
		MyItemCount = itemCount;
		let cid = exports["framework"].isPed("cid")
		emitNet("server-inventory-close",cid, invName)
		emit("current-items", JSON.parse(playerinventory));
	}
});

RegisterNetEvent('inventory-bar')
on('inventory-bar', (toggle) =>{
	SendNuiMessage(JSON.stringify({ response: "DisplayBar", toggle: toggle, boundItems: boundItems, boundItemsAmmo: boundItemsAmmo }))
});

RegisterNetEvent('inventory:receiveItem')
on('inventory:receiveItem', (itemid, amount, generateInformation) => {
	emitNet("inventory:ItemData", itemid, amount, generateInformation)
});

function GivePlyItem(id, amount, generateInformation) {
	emitNet("inventory:ItemData", id, amount, generateInformation)
}

function RemovePlyItem(itemid, amount) {
	removeItem(itemid, amount)
}

RegisterNetEvent('inventory:Client_ReItems')
on('inventory:Client_ReItems', (itemList) =>{
	SendNuiMessage(JSON.stringify({ response: "SetItemData", itemLis: itemList }))
});

RegisterNetEvent('inventory:removeItem')
on('inventory:removeItem', (itemid, amount) =>{
	removeItem(itemid, amount)
});

RegisterNetEvent('inventory:ItemMessage')
on('inventory:ItemMessage', (id, text) =>{
	emit("hud-display-item", id, text)
});

RegisterNetEvent('inventory:setAmmo')
on('inventory:setAmmo', (sentammoTable) =>{
	if (sentammoTable){
		ammoTable = sentammoTable
	}
	ResetCache(false)
});

RegisterNetEvent('hud-display-item')
on('hud-display-item', (itemid, text) =>{
	//if (openedInv) { return }
	SendNuiMessage(JSON.stringify({ response: "UseBar", itemid: itemid, text: text }))
});

RequestModel(GetHashKey("p_cs_lootSack01x"), true)

function LoadBags() {
	for (let Row in DrawInventories){
		let ply = PlayerPedId()
		let coords = GetEntityCoords(ply)


		let dst = Vdist(
			coords[0],coords[1],coords[2],
			DrawInventories[Row].position.x,
			DrawInventories[Row].position.y,
			DrawInventories[Row].position.z
		)

		let objectCheck = DrawInventories[Row].object

		if (dst < 35.0) {
			let modelHash = GetHashKey("p_cs_lootSack01x")
			RequestModel(modelHash, true)
			if (objectCheck == undefined || !DoesEntityExist(objectCheck) ) {
				DrawInventories[Row].object = CreateObject(modelHash, DrawInventories[Row].position.x, DrawInventories[Row].position.y, DrawInventories[Row].position.z, false,true,true,true,false)
				PlaceObjectOnGroundProperly(DrawInventories[Row].object)
				FreezeEntityPosition(DrawInventories[Row].object, true)
				SetEntityCollision(DrawInventories[Row].object,false,false)
			}
		}else if (DoesEntityExist(DrawInventories[Row].object)){
			DeleteObject(objectCheck)
		}
	}
}

setTick(LoadBags);

function DrawMarkers(row){
	let playerPos = GetEntityCoords(GetPlayerPed());
	let targetPos = row.position;
	let distanceb = GetDistanceBetweenCoords(playerPos[0], playerPos[1], playerPos[2], targetPos.x, targetPos.y, targetPos.z);
	let checkDistance = 12
	if ( IsPedInAnyVehicle(GetPlayerPed(), false)){
		checkDistance = 25
	}

	return distanceb < checkDistance;
}

function Scan(row) {
	let playerPos = GetEntityCoords(GetPlayerPed());
	let targetPos = row.position;
	let distancea = GetDistanceBetweenCoords(playerPos[0], playerPos[1], playerPos[2], targetPos.x, targetPos.y, targetPos.z);

	let checkDistance = 300;
	if (IsPedInAnyVehicle(GetPlayerPed(), false)) {
		checkDistance = 700;
	}
	return distancea < checkDistance;
}
function CacheInventories() {
	DrawInventories = NearInventories.filter(DrawMarkers);
}
setTick(CacheInventories)


function GetCloseInventorier() {
	NearInventories = DroppedInventories.filter(Scan);
}

setInterval(GetCloseInventorier, 15000)

RegisterNetEvent('CloseInv')
on('CloseInv', () =>{
	CloseGui(GetCloseInventorier, 30000);
});

RegisterNetEvent('OpenInv')
on('OpenInv', () =>{
	emit("inventory-open-request")
});

RegisterNetEvent('requested-dropped-items')
on('requested-dropped-items', (object) =>{
	DroppedInventories = object
});

RegisterNetEvent('client-inventory-close')
on('client-inventory-close', (targetinventoryName) =>{
	let cid = exports["framework"].isPed("cid")
	emitNet("server-inventory-close", cid, targetinventoryName)
});

RegisterNetEvent('inventory:GiveNewCurrentItem')
on('inventory:GiveNewCurrentItem', (itemid, amount, generateInformation, nonStacking) => {

	if (nonStacking == true) {

	}
	if (!isNaN(itemid)){
		generateInformation = true;
	}

	let slot = findSlot(itemid, amount, nonStacking)
	let cid = exports["framework"].isPed("cid")

	if (slot != 0){
		emit("hud-display-item", itemid, "Nostettu")
		emitNet("server-inventory-give", cid, itemid, slot, amount, {}, openedInv, generateInformation)
		SendNuiMessage( JSON.stringify({ response: "DisableMouse" }))
	}else {
		emit("hud-display-item", "errorINV", "Virhe")
	}
});

RegisterNuiCallbackType("InvUse2");
on("__cfx_nui:InvUse2", (data, cb) => {
	let cid = exports["framework"].isPed("cid")

	let inventoryUsedName = data.invName;
	let itemid = data.ItemId;
	let slotusing = data.SlotUsing;
	let isWeapon = data.IsWeapon;

	if (inventoryUsedName == "ply-" + cid) {
		if (isWeapon) {
			emit("RunUseItem", parseInt(itemid), slotusing, inventoryUsedName, isWeapon)
		} else {
			emit("RunUseItem", itemid, slotusing, inventoryUsedName, isWeapon)
		}
		
	}else {
		emit("hud-display-item", "error", "Virhe");
	}

	
})

