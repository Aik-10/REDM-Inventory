local usingitem = false
local MyInventory = {}

AddEventHandler('playerSpawned', TriggerServerEvent("server:ReturnItems"))

RegisterNetEvent("base:cIsPedLoad")
AddEventHandler("base:cIsPedLoad", function(firstname,lastname,cid)
    TriggerServerEvent("server-request-player-inventory", cid)
end)

RegisterNetEvent("current-items")
AddEventHandler("current-items", function(inv)
    MyInventory = inv
    UpdateAmmoFromServer()
end)

getQuantity = function (itemid)
    local amount = 0
  
    for i,v in pairs(MyInventory) do
        if (v.item_id == itemid) then
            amount = amount + 1
        end
    end

    return amount
    
end

RegisterNetEvent("RunUseItem")
AddEventHandler("RunUseItem", function(itemid, slotusing, inventoryName, isWeapon)

    if (itemid == nil) then return end
    if usingitem then return end

    TriggerEvent("hud-display-item", itemid, "Käytetty")
    
    if isWeapon then
        GiveWeapon(itemid)
        return
    end
    local IsAmmo = AddAmmo(itemid)
    if IsAmmo then
        TriggerEvent("UpdateWeaponAmmoForced")
    end

    if remove then
        TriggerEvent('inventory:removeItem', itemid, 1)
    end
    
end)