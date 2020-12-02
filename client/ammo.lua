local equipWeapon = nil
local armed = false


function UpdateWeaponAmmoTick()

    local hasWeapon, weaponHash = GetCurrentPedWeapon(GetPlayerPed(), true, 0, true)
    if hasWeapon and GetWeapontypeGroup(weaponHash) ~= -1609580060 then
        local ammoName = GroupTextToAmmo[GroupHashToText[GetWeapontypeGroup(weaponHash)]]
        local clientQuanity = GetAmmoInPedWeapon(GetPlayerPed(), weaponhash)
        local invQuantity = getQuantity(ammoName)
        local wtype = GroupHashToText[GetWeapontypeGroup(weaponHash)]

        if wtype == "Thrown" then
        elseif wtype == "Lasso" then
        elseif wtype == "Fishing" then
        elseif wtype == "Lantern" then
        elseif wtype == "Sword" then
        elseif wtype == "Torch" then
        elseif wtype == "Melee" then
        else 
            UpdateAmmoFromServer()
            if invQuantity == 0 then
                ResetWeapon(weaponHash, 0)
            end
        end
        

        if (clientQuanity < invQuantity) then

            local differencd = (invQuantity - clientQuanity) - 40

            if not doUpdate then
                doUpdate = true
                updateTick = 3
            end

            if clientQuanity < 2 then
                updateTick = 0
            end

            if (invQuantity > 40 and differencd >= 10) then
                local buffer = invQuantity - 40

                local boxAmount = math.floor( buffer / 10 )

                local leftOver = invQuantity - (boxAmount * 10)
                local removeAmount = invQuantity - leftOver

                ResetWeapon(weaponHash, leftOver)
                TriggerEvent("client-inventory-remove-any", ammoName, removeAmount)
                TriggerEvent("inventory:receiveItem", AmmoToAmmoBox[ammoName], boxAmount)

                Wait(1000)
            end
        end

        if doUpdate then
            updateTick = updateTick - 1
            if updateTick < 1 then
                updateTick = 3
                doUpdate = false
                UpdateWeaponAmmoForced(true)
                Wait(1000)
            end
        end
    end
end

function ResetWeapon( weaponHash, ammo )
    RemoveAllPedWeapons(GetPlayerPed(), true, true)
    GiveWeaponToPed_2(GetPlayerPed(), weaponHash, ammo,true)
end

RegisterNetEvent("UpdateWeaponAmmoForced")
AddEventHandler("UpdateWeaponAmmoForced", function()
    UpdateWeaponAmmoForced(false)
    RemoveAllPedWeapons(GetPlayerPed(), true, true)
end)

GiveWeapon = function( weaponHash )
    if armed then
        TriggerEvent("UpdateWeaponAmmoForced")
        armed = false
    else
        armed = true
        UpdateWeaponAmmoForced()
        RemoveAllPedWeapons(GetPlayerPed(), true, true)
        local wtype = GroupHashToText[GetWeapontypeGroup(weaponHash)]
        equipWeapon= weaponHash
        if wtype == "Thrown" then
            local ammoCount = getQuantity(""..weaponHash.."")
            GiveWeaponToPed_2( GetPlayerPed(), weaponHash, ammoCount, true, 1, false, 0.0)
            
        else
            local ammoName = GroupTextToAmmo[wtype]
            local ammoCount = getQuantity(ammoName)
            GiveWeaponToPed_2( GetPlayerPed(), weaponHash, ammoCount, true, 1, false, 0.0)
        end
    end
end

function UpdateWeaponAmmoForced()
    local hasWeapon, weaponHash = GetCurrentPedWeapon(GetPlayerPed(), true, 0, true)
    if hasWeapon and GetWeapontypeGroup(weaponHash) then
        local ammoName = GroupTextToAmmo[GroupHashToText[GetWeapontypeGroup(weaponHash)]]

        local clientQuanity = GetAmmoInPedWeapon(GetPlayerPed(), weaponhash)
        local invQuantity = getQuantity(ammoName)


        if invQuantity > clientQuanity then
            local amount = invQuantity - clientQuanity
            --TriggerEvent("client-inventory-remove-any", ammoName, amount)
        end
    end
end

Citizen.CreateThread( function ()
    while true do
        Wait(1000)
        UpdateWeaponAmmoTick()
    end
end)

UpdateAmmoFromServer = function ()
    local hasWeapon, weaponHash = GetCurrentPedWeapon(GetPlayerPed(), true, 0, true)
    if hasWeapon and GetWeapontypeGroup(weaponHash) then
       
        local wtype = GroupHashToText[GetWeapontypeGroup(weaponHash)]
        local ammoName = GroupTextToAmmo[GroupHashToText[GetWeapontypeGroup(weaponHash)]]
        local clientQuanity = GetAmmoInPedWeapon(GetPlayerPed(), weaponhash)

        local invQuantity = getQuantity(ammoName)
        if wtype == "Thrown" then
             return
        else
            if invQuantity < clientQuanity then
                SetPedAmmo(GetPlayerPed(), weaponHash, invQuantity)
            end
        end

        
    end
end

Citizen.CreateThread(function()
    while true do
        if IsPedShooting(GetPlayerPed()) then
            local hasWeapon, weaponHash = GetCurrentPedWeapon(GetPlayerPed(), true, 0, true)
            local ammo = GetAmmoInPedWeapon(GetPlayerPed(), weaponHash)
            local group = GetWeapontypeGroup(weaponHash)

            if group == -1609580060 then
                weaponHash = equipWeapon
                local wtype = GroupHashToText[GetWeapontypeGroup(weaponHash)]
                ammo = "".. weaponHash ..""
                TriggerEvent("client-inventory-remove-any", ammo, 1)

            else

                local ammoName = GroupTextToAmmo[GroupHashToText[GetWeapontypeGroup(weaponHash)]]
                local invQuantity = getQuantity(ammoName)
                local wtype = GroupHashToText[GetWeapontypeGroup(weaponHash)]

                if ammo ~= 0 then
                    if wtype == "Thrown" then
                        ammoName = "".. weaponHash .. ""
                    end
    
                    TriggerEvent("client-inventory-remove-any", ammoName, 1)
                else
                    TriggerEvent("client-inventory-remove-any", ammoName, 1)
                end
            end
        end
        Wait(1)
    end
end)

AddAmmo = function (itemid)
    if AmmoBoxToAmmo[itemid] then

        local above = 0
        local convertedAmmo = AmmoBoxToAmmo[itemid]
        local quantity = getQuantity(convertedAmmo)

        if quantity > 39 then
            return
        else
            if quantity > 30 then
                local above = quantity - 30
                quantity = quantity - above
            end

            TriggerEvent("inventory:receiveItem", convertedAmmo, 10 - above)
            TriggerEvent("client-inventory-remove-any", itemid, 1)
            
        end
        return true
    else 
        return false
    end
end

