
function CleanDroppedInventories() {
	db(`DELETE FROM character_inventory WHERE dropped='1'`);
	db(`DELETE FROM character_inventory WHERE name='TRASHED'`);
}

function db(string) {
	exports.ghmattimysql.execute(string,{},function(result) {

	});
}

CleanDroppedInventories();


function DroppedItem(itemArrey) {
	itemArrey = JSON.parse(itemArrey)
	var shopitems = [];

	for (i=0; i < itemArrey.length; i++){
		shopitems[i] = {item_id: itemArrey[i].itemid, id: 0, name: "shop", information: "{}", slot: i+1, amount: itemArrey[i].amount };
	}

	return JSON.stringify(shopitems);
}

var DroppedInventories = [];
var InUseInventories = {};
var DataEntries = 0;

function GenerateInformation(player, itemid) {
	returnInfo = {}
	if (typeof parseint(itemid) == 'number') {
		let cartridgeCreated = player + "-" + makeid(6) + "-" + Math.floor((Math.random() * 999999) + 1);
		returnInfo = JSON.stringify({cartridge: cartridgeCreated, serial: player})
	}
	return returnInfo;
}

function makeid(length) {
	var result = ''
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLenght = characters.length
	for (var i = 0; i < length; i++){
		result += characters.charAt(Math.floor(Math.random() * charactersLenght))
	}
	return result;
}

RegisterServerEvent("server-request-remove-any")
onNet("server-request-remove-any", async (player) => {
	emit("CloseInv", source)
	let playerinvname = 'ply-'+ player

	db(`UPDATE character_inventory SET name='TRASHED' WHERE name='${playerinvname}'`);
	emit("CloseInv", source)
});

RegisterServerEvent("server-request-update-src")
onNet("server-request-update-src", async (player, src) => {
	let playerinvname = "ply-" + player
	let string = `SELECT * FROM character_inventory WHERE name='${playerinvname}'`;
	exports.ghmattimysql.execute(string, {}, function(inventory) {
		playerinvname = JSON.stringify(playerinvname)

		let invArrey = []
		let i;
		let arreyCount = 0;

		for (let i = 0; i < inventory.length; i++){
			invArrey[arreyCount] = { item_id: inventory[i].item_id, id: inventory[i].id, name: inventory[i].name, information: inventory[i].information, slot: inventory[i].slot }
			arreyCount = arreyCount + 1
		}

		invArrey = JSON.stringify(invArrey)
		
		emitNet("inventory-update-player", src, [invArrey, arreyCount, playerinvname]);
	}); 
});

RegisterServerEvent("server-request-player-inventory")
onNet("server-request-player-inventory", async (cid) => {
	let src = source 
	let playerinvname = "ply-" + cid
	let string = `SELECT * FROM character_inventory WHERE name='${playerinvname}'`;
	exports.ghmattimysql.execute(string, {}, function(inventory) {
		
		let invArrey = []
		let i;
		let arreyCount = 0;

		for (let i = 0; i < inventory.length; i++){
			invArrey[arreyCount] = { item_id: inventory[i].item_id, id: inventory[i].id, name: inventory[i].name, information: inventory[i].information, slot: inventory[i].slot }
			arreyCount = arreyCount + 1
		}

		invArrey = JSON.stringify(invArrey)

		emitNet("inventory-update-player-inventory", src, [invArrey, arreyCount]);
	}); 
});

RegisterServerEvent("server-request-update")
onNet("server-request-update", async (player) => {
	let src = source 
	let playerinvname = "ply-" + player
	let string = `SELECT * FROM character_inventory WHERE name='${playerinvname}'`;
	exports.ghmattimysql.execute(string, {}, function(inventory) {

		playerinvname = JSON.stringify(playerinvname)

		let invArrey = []
		let i;
		let arreyCount = 0;

		for (let i = 0; i < inventory.length; i++){
			invArrey[arreyCount] = { item_id: inventory[i].item_id, id: inventory[i].id, name: inventory[i].name, information: inventory[i].information, slot: inventory[i].slot }
			arreyCount = arreyCount + 1
		}

		invArrey = JSON.stringify(invArrey)

		emitNet("inventory-update-player", src, [invArrey, arreyCount, playerinvname]);
	}); 
});

RegisterServerEvent("server-inventory-give")
onNet("server-inventory-give", async (player, itemid, slot, amount, information, openedInv, generateInformation) => {
	let src = source
	let playerinvname = "ply-" + player
	information = "{}"
	// let isANumber = isNaN(itemid) === false;


	

	// if (isANumber){
	//     amount = 1
	// }
	
	if (generateInformation){
		//information = GenerateInformation(player, itemid)
	}
	let string = `('${playerinvname}', '${itemid}', '${information}', '${slot}')` 


	if (amount > 1) {
		for (let i = 2; i <= amount; i++){
			string = string + `,('${playerinvname}', '${itemid}', '${information}','${slot}')`
		}
	}

	if (openedInv) {
		string2 = `INSERT INTO character_inventory (name, item_id, information, slot) VALUES ${string};`
		exports.ghmattimysql.execute(string2, {}, function() {
			emit("server-request-update-src", player, src)
		})
	}
	else {
		db(`INSERT INTO character_inventory (name, item_id, information,slot) VALUES ${string};`);
	}

	emit("server-request-update-src", player, src)
	
});


RegisterServerEvent("server-inventory-open")
onNet("server-inventory-open", async (coords, player, secondInventory, targetName, itemToDropArrey) => {
	var src = source
	var playerinvname = "ply-" + player
	let test1 = JSON.stringify(targetName)

	if (InUseInventories[playerinvname]){


	}
	if (InUseInventories[targetName]){

	}
	if (InUseInventories[test1]){

		return
	}


	if (InUseInventories[targetName] || InUseInventories[playerinvname]){

		
		if( (InUseInventories[playerinvname] === player) && (InUseInventories[targetName])) {
			if (InUseInventories[targetName] !== player){
				secondInventory = 69
			}
		}
		
		else if ( InUseInventories[targetName]) {
			if ( InUseInventories[targetName] === player){
				
			}else {
				return;
			}
		}else{
			return;
		}
	}

	let string = `SELECT * FROM character_inventory WHERE name = 'ply-${player}'`;
	
	exports.ghmattimysql.execute(string, {} ,function(inventory) {
		playerinvname = JSON.stringify(playerinvname)

		var invArrey = {};

		var i;
		var arreyCount = 0;

		for (i = 0; i < inventory.length; i++) {
			invArrey[arreyCount] = {item_id: inventory[i].item_id, id: inventory[i].id, name: inventory[i].name, information: inventory[i].information, slot: inventory[i].slot};
			arreyCount = arreyCount +1;
			
		}
		invArrey = JSON.stringify(invArrey)
		var test = JSON.parse(invArrey)

		InUseInventories[playerinvname] = player;

		if (secondInventory == "1"){
			var targetinvname = JSON.stringify(targetName)

			let string = `SELECT * FROM character_inventory WHERE name = '${targetName}'`;

			exports.ghmattimysql.execute(string,{},function(inventory) {
				var invArreyTarget = {};
				var i;
				var arreyCountTarget = 0;
				for (i = 0; i < inventory.length; i++) {
					invArreyTarget[arreyCountTarget] = {item_id: inventory[i].item_id, id: inventory[i].id, name: inventory[i].name, information: inventory[i].information, slot: inventory[i].slot};
					arreyCountTarget = arreyCountTarget + 1;
				}
				var invArreyTarget = JSON.stringify(invArreyTarget)
				emitNet("inventory-open-target", src, [invArrey, arreyCount, playerinvname,invArreyTarget, arreyCountTarget, targetinvname, 500]);	
				InUseInventories[targetName] = player

			});
		}
		else if (secondInventory == "3"){

			let Key = ""+DataEntries+"";
			let NewDroppedName = 'Pudota-'+Key;

			DataEntries = DataEntries + 1
			var invArreyTarget = [];
			
			DroppedInventories[NewDroppedName] = {position: {x: coords[0], y: coords[1], z: coords[2]}, name: NewDroppedName, used: false}

			InUseInventories[NewDroppedName] = player;
			invArreyTarget = JSON.stringify(invArreyTarget);
			NewDroppedName = JSON.stringify(NewDroppedName);
			emitNet('inventory-open-target', src, [invArrey, arreyCount,playerinvname,invArreyTarget,0, NewDroppedName, 500]);

		}

		else if (secondInventory == "13"){
			let Key = ""+DataEntries+"";
			let NewDroppedName = 'Pudota-'+Key;
			DataEntries = DataEntries + 1
			
			for ( let key in itemToDropArrey ){
				let itemids = itemToDropArrey[key].item_id.join(",")
				let newslot = itemToDropArrey[key].slot

				let string = `UPDATE character_inventory SET slot='${newslot}', name='${NewDroppedName}', dropped='1' WHERE id IN (${itemids})`; 
				db(string)
			}
			DroppedInventories[NewDroppedName] = {position: {x: coords[0], y: coords[1], z: coords[2]}, name: NewDroppedName, used: false}
			emitNet('Inventory-Dropped-Addition', -1, DroppedInventories[NewDroppedName]);
		}

		else if (secondInventory == "2"){
			var targetinvname = targetName;
			var shopArrey = GetShop("generalStore")
			var shopAmount = 6;
			emitNet("inventory-open-target", src, [invArrey,arreyCount,playerinvname,shopArrey,shopAmount,targetinvname,500]);
		}

		else if (secondInventory == "4"){
			var targetinvname = targetName;
			var shopArrey = GetShop("weaponStore")
			var shopAmount = 4;
			emitNet("inventory-open-target", src, [invArrey,arreyCount,playerinvname,shopArrey,shopAmount,targetinvname,500]);
		}

		else if (secondInventory == "5"){

			var targetinvname = targetName;
			var shopArrey = GetShop("saloon")
			var shopAmount = 4;
			emitNet("inventory-open-target", src, [invArrey,arreyCount,playerinvname,shopArrey,shopAmount,targetinvname,500]);
		}

		else if (secondInventory == "6"){

			var targetinvname = targetName;
			var shopArrey = CraftRifleStoreGangs();
			var shopAmount = 11;
			emitNet("inventory-open-target", src, [invArrey,arreyCount,playerinvname,shopArrey,shopAmount,targetinvname,500]);
		}

		else if (secondInventory == "8"){

			var targetinvname = targetName;
			var shopArrey = CraftRifleCivilians();
			var shopAmount = 16;
			emitNet("inventory-open-target", src, [invArrey,arreyCount,playerinvname,shopArrey,shopAmount,targetinvname,500]);
		}

		else if (secondInventory == "9"){

			var targetinvname = targetName;
			var shopArrey = GroveStore();
			var shopAmount = 12;
			emitNet("inventory-open-target", src, [invArrey,arreyCount,playerinvname,shopArrey,shopAmount,targetinvname,500]);
		}
		else if (secondInventory == "10"){

			var targetinvname = targetName;
			var shopArrey = PoliceArmory();
			var shopAmount = 15;
			emitNet("inventory-open-target", src, [invArrey,arreyCount,playerinvname,shopArrey,shopAmount,targetinvname,500]);
		}

		else if (secondInventory == "12"){

			var targetinvname = targetName;
			var shopArrey = BurgiesStore();
			var shopAmount = 8;
			emitNet("inventory-open-target", src, [invArrey,arreyCount,playerinvname,shopArrey,shopAmount,targetinvname,500]);
		}

		else if (secondInventory == "11"){
			emitNet("inventory-open-target-NoInject", src, [invArrey,arreyCount,playerinvname]);
		}
		else if (secondInventory == "7"){

			var targetinvname = targetName;
			var shopArrey = DroppedItem(itemToDropArrey);

			itemToDropArrey = JSON.parse(itemToDropArrey);
			var shopAmount = itemToDropArrey.length;

			emitNet("inventory-open-target", src, [invArrey,arreyCount,playerinvname,shopArrey,shopAmount,targetinvname,500]);
		}else {

			//emitNet("inventory-open-target", src, [invArrey,arreyCount,playerinvname]);

		}
	}); 
});

RegisterServerEvent("server-inventory-close")
onNet("server-inventory-close", async (player, targetInventoryName) => {
	let name = targetInventoryName.replace(/"/g, "");
	let plyinvname = "ply-"+player
	plyinvname = JSON.stringify(plyinvname)

	if (targetInventoryName.indexOf("Pudota") > -1 && DroppedInventories[targetInventoryName]){
		if (DroppedInventories[targetInventoryName].used === false){
			var foundIndex = -1;
			let i = 0;
			for (let Row in DroppedInventories){
				if (Row == targetInventoryName){
					foundIndex = i;
					break;
				}
				i++
			}
			if (foundIndex > -1) {
				DroppedInventories.splice(foundIndex, 1);
			}
		}
	}else {
		
		let string = `SELECT * FROM character_inventory WHERE name='${name}'`;
		exports.ghmattimysql.execute(string, {}, function(inventory) {
			
			if (inventory.length === 0 && DroppedInventories[name]) {
				let foundIndex = -1;

				let i = 0;
				for (let Row in DroppedInventories){
					if (Row == name){
						foundIndex = i;
						break;
					}
					i++
				}

				if (foundIndex > -1) {
					DroppedInventories.splice(foundIndex, 1);
					emitNet("Inventory-Dropped-Remove", -1, [name])
				}
			}

		});
	}

	if (InUseInventories[name] == player){
		delete InUseInventories[name]
	}

	if (InUseInventories[plyinvname] == player){
		delete InUseInventories[plyinvname]
	}

	
	
	//InUseInventories = InUseInventories.filter(name => name != player);

	emit("server-request-update-src", player, source)

});

RegisterServerEvent("server-inventory-stack")
onNet("server-inventory-stack", async (player, data, coords) => {

	let targetslot = data[0]
	let moveAmount = data[1]
	let targetname = data[2].replace(/"/g, "");
	let originSlot = data[3]

	let originInventory = data[4].replace(/"/g, "");

	let purchase = data[5]
	let itemCosts = data[6]
	let itemidsent = data[7]
	let amount = data[8]
	let crafting = data[9]

	if ((targetname.indexOf("Pudota") > -1 || targetname.indexOf("hidden") > -1) && DroppedInventories[targetname]){

		if (DroppedInventories[targetname].used === false){

			DroppedInventories[targetname] = {position: { x: coords[0], y: coords[1], z: coords[2] }, name: targetname, used: true}
			emitNet("Inventory-Dropped-Addition", -1, DroppedInventories[targetname] )

		}
	}

	if (purchase){

		let canBuy = true
		if (!canBuy) return;

		for(i = 0; i < parseInt(amount); i++){

			//console.log(`INSERT INTO character_inventory (item_id, name, information, slot) VALUES ('${itemidsent}','${targetname}', '{}','${targetslot}');`);
			db(`INSERT INTO character_inventory (item_id, name, information, slot) VALUES ('${itemidsent}','${targetname}', '{}','${targetslot}');`);
		}
	} else if (crafting) {
		for(i = 0; i < parseInt(amount); i++){
			//console.log(`INSERT INTO character_inventory (item_id, name, information, slot) VALUES ('${itemidsent}','${targetname}', '{}','${targetslot}');`);
			db(`INSERT INTO character_inventory (item_id, name, information, slot) VALUES ('${itemidsent}','${targetname}', '{}','${targetslot}');`);
		}
	}
	else {
		//console.log(`SELECT * FROM character_inventory WHERE slot='${originSlot}' AND name='${originInventory}' LIMIT ${moveAmount}`);
		let string = `SELECT * FROM character_inventory WHERE slot='${originSlot}' AND name='${originInventory}' LIMIT ${moveAmount}`;

		exports.ghmattimysql.execute(string, {}, function(startid) {

			var itemids = "0";
			for (let i = 0; i < startid.length; i++){
				itemids = itemids + "," + startid[i].id
			}

			if (targetname.indexOf("Pudota") > -1 || targetname.indexOf("hidden") > -1){
				//console.log(`UPDATE character_inventory SET slot='${targetslot}', name='${targetname}', dropped='1' WHERE id IN (${itemids});`);
				db(`UPDATE character_inventory SET slot='${targetslot}', name='${targetname}', dropped='1' WHERE id IN (${itemids});`);
			}else {
				//console.log(`UPDATE character_inventory SET slot='${targetslot}', name='${targetname}', dropped='0' WHERE id IN (${itemids})`);
				db(`UPDATE character_inventory SET slot='${targetslot}', name='${targetname}', dropped='0' WHERE id IN (${itemids});`);
			}
		})
	}
});

RegisterServerEvent("server-inventory-move")
onNet("server-inventory-move", async (player, data, coords) => {
	
	let targetslot = data[0]
	let startslot = data[1]
	let targetname = data[2].replace(/"/g, "")
	let startname = data[3].replace(/"/g, "")
	let purchase = data[4]
	let itemCosts = data[5]
	let itemidsend = data[6]
	let amount = data[7]
	let crafting = data[8]
	
	if ((targetname.indexOf("Pudota") > -1 || targetname.indexOf("hidden") > -1) && DroppedInventories[targetname]){
		if (DroppedInventories[targetname].used === false){

			DroppedInventories[targetname] = {position: {x: coords[0], y: coords[1], z: coords[2]}, name: targetname, used: true}
			emitNet("Inventory-Dropped-Addition", -1, DroppedInventories[targetname])
		}
	}

	let info = {}

	if (purchase){

		info = GenerateInformation(player, itemidsent)

		let canBuy = true
		if (!canBuy) return;

		for(i = 0; i < parseInt(amount); i++){
			//console.log(itemidsent)
			//console.log(`INSERT INTO character_inventory (item_id, name, information, slot) VALUES ('${itemidsent}','${targetname}', '{}','${targetslot}');`);
			db(`INSERT INTO character_inventory (item_id, name, information, slot) VALUES ('${itemidsent}','${targetname}', '{}','${targetslot}');`);
		}
	}
	else if (crafting) {
		for(i = 0; i < parseInt(amount); i++){
			//console.log(`INSERT INTO character_inventory (item_id, name, information, slot) VALUES ('${itemidsent}','${targetname}', '{}','${targetslot}');`);
			db(`INSERT INTO character_inventory (item_id, name, information, slot) VALUES ('${itemidsent}','${targetname}', '{}','${targetslot}');`);
		}
	}
	else {
		if (targetname.indexOf("Pudota") > -1 || targetname.indexOf("hidden") > -1) {
			//console.log(`UPDATE character_inventory SET slot='${targetslot}', name='${targetname}', dropped='1' WHERE slot='${startslot}' AND name='${startname}'`);
			db(`UPDATE character_inventory SET slot='${targetslot}', name='${targetname}', dropped='1' WHERE slot='${startslot}' AND name='${startname}'`);

		} else {
			//console.log(`UPDATE character_inventory SET slot='${targetslot}', name='${targetname}', dropped='0' WHERE slot='${startslot}' AND name='${startname}'`);
			db(`UPDATE character_inventory SET slot='${targetslot}', name='${targetname}', dropped='0' WHERE slot='${startslot}' AND name='${startname}'`);

		}
	}
});

RegisterServerEvent("server-remove-item")
onNet("server-remove-item", async (player, itemid, amount, openedInv) => {
	let src = source
	var playerinvname = 'ply-' + player
	//console.log(player+ " "+itemid + " " + amount+ " " +  openedInv + " " +playerinvname)
	//console.log(`DELETE FROM character_inventory WHERE name='${playerinvname}' AND item_id='${itemid}' LIMIT ${amount}`)
	db(`DELETE FROM character_inventory WHERE name='${playerinvname}' AND item_id='${itemid}' LIMIT ${amount}`);

	emit("server-request-update-src", player, src)
});

RegisterServerEvent("server-inventory-remove-slot")
onNet("server-inventory-remove-slot", async (cid, slot) => {
	let src = source
	var playerinvname = 'ply-' + cid
	
	db(`UPDATE character_inventory SET name='TRASHED' WHERE name='${playerinvname}' AND slot='${slot}'`);

	emit("server-request-update-src", player, src)
});


RegisterServerEvent("server-inventory-remove-any")
onNet("server-inventory-remove-any", async ( itemid,amount, player ) => {
	let src = source

	var playerinvname = 'ply-' + player
	//db(`DELETE FROM character_inventory WHERE name='${playerinvname}' AND item_id='${itemid}' LIMIT ${amount}`);
	db(`UPDATE character_inventory SET name='TRASHED' WHERE name='${playerinvname}' AND item_id='${itemid}' LIMIT ${amount}`);

	emit("server-request-update-src", player, src)
});


RegisterServerEvent("server-check-item")
onNet("server-check-item", async (player, itemid) => {
	let src = source
	var playerinvname = 'ply-' + player
	let string = `SELECT * FROM character_inventory WHERE item_id='${itemid}' AND name='${playerinvname} '`;
	exports.ghmattimysql.execute(string, {}, function(startid) {
		let data = startid.length
		emitNet("inventory:CheckPlayeritemRe", source, data)
	})
});


RegisterServerEvent("server-inventory-remove")
onNet("server-inventory-remove", async (player, itemidsent, amount) => {
	let src = source
	var playerinvname = 'ply-' + player
	db(`UPDATE character_inventory SET name='TRASHED' WHERE name='${playerinvname}' AND item_id='${itemidsent}' LIMIT ${amount}`);
	emit("server-request-update-src", player, src)
});

RegisterServerEvent("server-inventory-removeCraftItems")
onNet("server-inventory-removeCraftItems", async (player, refinedwood, plastic, rubber, steel) => {	

});

RegisterServerEvent("server-inventory-swap")
onNet("server-inventory-swap", async (player, data, coords) => {
	let targetslot = data[0]
	let targetname = data[1].replace(/"/g, "")
	let startslot = data[2]
	let startname = data[3].replace(/"/g, "")
	//console.log(`SELECT * FROM character_inventory WHERE slot='${targetslot}' AND name='${targetname}'`)
	let string = `SELECT * FROM character_inventory WHERE slot='${targetslot}' AND name='${targetname}'`;

	exports.ghmattimysql.execute(string, {}, function(startid) {
		var itemids = "0"
		for (i = 0; i < startid.length; i++){
			itemids = itemids + ", " + startid[i].id 
		}

		setTimeout(function(){
			if (targetname.indexOf("Pudota") > -1 || targetname.indexOf("hidden") > -1 ){
				//console.log(`UPDATE character_inventory SET slot='${targetslot}', name='${targetname}', dropped='1' WHERE slot='${startslot}' AND name='${startname}'`)
				db(`UPDATE character_inventory SET slot='${targetslot}', name='${targetname}', dropped='1' WHERE slot='${startslot}' AND name='${startname}'`);
			}else {
				//console.log(`UPDATE character_inventory SET slot='${targetslot}', name='${targetname}', dropped='0' WHERE slot='${startslot}' AND name='${startname}'`)
				db(`UPDATE character_inventory SET slot='${targetslot}', name='${targetname}', dropped='0' WHERE slot='${startslot}' AND name='${startname}'`);
			}
		}, 200);

		setTimeout(function(){
			if (startname.indexOf("Pudota") > -1 || startname.indexOf("hidden") > -1 ){
				//console.log(`UPDATE character_inventory SET slot='${startslot}', name='${startname}', dropped='1' WHERE id IN (${itemids})`)
				db(`UPDATE character_inventory SET slot='${startslot}', name='${startname}', dropped='1' WHERE id IN (${itemids})`);
			}else {
				//console.log(`UPDATE character_inventory SET slot='${startslot}', name='${startname}', dropped='0' WHERE id IN (${itemids})`)
				db(`UPDATE character_inventory SET slot='${startslot}', name='${startname}', dropped='0' WHERE id IN (${itemids})`);
			}
		}, 400); 
	})
});

function updateClientInventory(player) {
	var inventory = db(`SELECT * FROM character_inventory WHERE name='ply-${player}'`);
	playerinvname = JSON.stringify(playerinvname)

	var invArrey = {};
	var i;
	var arreyCount = 0;
	for (i = 0; i < inventory.length; i++){
		invArrey[arreyCount] = {item_id: inventory[i].item_id, id: inventory[i].id, name: inventory[i].name, information: inventory[i].information, slot: inventory[i].slot};
		arreyCount = arreyCount + 1;
	}
	invArrey = JSON.stringify(invArrey)
	emitNet("inventory-open-player", [invArrey, arreyCount]);
}
