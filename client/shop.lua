-- Stores
Citizen.CreateThread(function () 
    while true do
        Wait(1)

        local coords = GetEntityCoords(PlayerPedId())
        
        for k,v in pairs(GeneralStoret) do
            local position = GeneralStoret[k]
            local dist = GetDistanceBetweenCoords(position["x"], position["y"], position["z"], coords, true)
            if dist <= 5.0 then
                DrawText3D(position["x"], position["y"], position["z"], "[B] Avataksesi kauppa")
                
                if IsControlJustPressed(0, 0x4CC0E2FE) and dist <= 2.5 then -- [B]
                    local cid = exports.framework:isPed('cid')
                    TriggerEvent("server-inventory-open", "2", "Shop")
                end
            end
        end
    end
end)

-- Baarit
Citizen.CreateThread(function () 
    while true do
        Wait(1)

        local coords = GetEntityCoords(PlayerPedId())
        
        for k,v in pairs(Baarit) do
            local position = Baarit[k]
            local dist = GetDistanceBetweenCoords(position["x"], position["y"], position["z"], coords, true)
            if dist <= 5.0 then
                DrawText3D(position["x"], position["y"], position["z"], "[B] Avataksesi kauppa")
                
                if IsControlJustPressed(0, 0x4CC0E2FE) and dist <= 2.5 then -- [B]
                    local cid = exports.framework:isPed('cid')
                    TriggerEvent("server-inventory-open", "5", "Shop")
                end
            end
        end
    end
end)

-- Asekaupat
Citizen.CreateThread(function () 
    while true do
        Wait(1)

        local coords = GetEntityCoords(PlayerPedId())
        
        for k,v in pairs(Asekaupat) do
            local position = Asekaupat[k]
            local dist = GetDistanceBetweenCoords(position["x"], position["y"], position["z"], coords, true)
            if dist <= 5.0 then
                DrawText3D(position["x"], position["y"], position["z"], "[B] Avataksesi kauppa")
                
                if IsControlJustPressed(0, 0x4CC0E2FE) and dist <= 2.5 then -- [B]
                    local cid = exports.framework:isPed('cid')
                    TriggerEvent("server-inventory-open", "4", "Shop")
                end
            end
        end
    end
end)


function DrawText3D(x, y, z, text)
    local pelaaja = GetPlayerPed(source)
    local positioni = GetEntityCoords(pelaaja)
    local matka = Citizen.InvokeNative(0x0BE7F4E3CDBAFB28, positioni.x, positioni.y, positioni.z, x, y, z, true, Citizen.ResultAsFloat())

    if matka > 2.5 then
        return
    end

    local scale = 0.6 - matka/10
    local x,y = ScreenCoord(x,y,z)
    local str = CreateVarString(10, "LITERAL_STRING", text)
    local factor = (string.len(text)) / 370

    DrawTexture("boot_flow", "selection_box_bg_1d", x + 0.07, y + 0.015, 0.1 + factor, 0.06, 0.5, 0, 0, 0, 190, true)
    SetTextScale(0.40, 0.40)
    SetTextColor(200, 200, 200, 215)
    DisplayText(str, x, y, scale)
end

function ScreenCoord(x, y, z)
    return Citizen.InvokeNative(0xCB50D7AFCC8B0EC6, x, y, z, Citizen.PointerValueFloat(), Citizen.PointerValueFloat()) --GetScreenCoordFromWorldCoord
end

function DrawTexture(textureStreamed, textureName, x, y, z, width, height, rotation, r, g, b, a, p11)
        if not HasStreamedTextureDictLoaded(textureStreamed) then
        RequestStreamedTextureDict(textureStreamed, false)
    else
        DrawSprite(textureStreamed, textureName, x, y, z, width, height, rotation, r, g, b, a, p11)
    end
end

function DrawText(str, x, y, enableShadow, col1, col2, col3)
    local str = CreateVarString(10, "LITERAL_STRING", str)

    SetTextScale(0.30, 0.30)
    SetTextColor(math.floor(col1), math.floor(col2), math.floor(col3), 255)
    DisplayText(str, x, y)
end

function CreateVarString(p0, p1, variadic)
    return Citizen.InvokeNative(0xFA925AC00EB830B9, p0, p1, variadic, Citizen.ResultAsLong())
end