fx_version 'adamant'
game 'common'

ui_page "nui/ui.html"

client_scripts { '@config/config/weapons.lua', '@config/config/location.lua',  'client/*' } 
server_scripts { 'server/*' } 

server_exports { 'GetShop' } 
exports {
    'getQuantity',
    'RemovePlyItem',
    'GivePlyItem',
}


files {
  "nui/*",
  "nui/fonts/*",
  'nui/icons/*',
  'nui/img/*.png',
}