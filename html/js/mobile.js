var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
items_to_float = ['piece_list', 'ctrl_buttons'];

function show_mobile_display()
{
    if (!isMobile) { return;}

    for(idx in items_to_float)
    {
        item = document.getElementById(items_to_float[idx]);
        item.style.position = 'inherit';
    }

    settings = document.getElementById('div_settings');
    log = document.getElementById('log_container');
    board = document.getElementById('board_div');

    // settings.parentNode.insertBefore(settings, log);
    // settings.after(log);
    // log.before(settings);
    log.after(settings);

    move_first = document.getElementById('move_first');
    board.after(move_first);

    core_ctrl = document.getElementById('core_ctrl');
    move_first.after(core_ctrl);

    clear_button = document.createElement('button');
    clear_button.id = 'clear_button';
    clear_button.innerHTML = '清屏';
   
    core_ctrl.appendChild(clear_button);

    his_back_button = document.getElementById('his_back');
    ponder_buttton = document.getElementById('ponder');
    ponder_buttton.after(his_back_button);

    content1 = move_first.innerHTML;
    content2 = core_ctrl.innerHTML;

    move_first.innerHTML = content1 + ' ' + content2;
    core_ctrl.innerHTML = '';

    site_width = 534;
    scale = screen.width / site_width * 2;

    // document.querySelector('meta[name="viewport"]').setAttribute('content', 'width='+site_width+', initial-scale='+scale+'');

    document.getElementById('board_str').size = 36;

    // document.getElementById('ponder').style.width = '70px';
    document.getElementById('ponder').classList.add('mobile');

    // document.getElementById('move').style.width = '70px';
    document.getElementById('move').classList.add('mobile');

    // document.getElementById('clear_button').style.width = '70px';
    document.getElementById('clear_button').classList.add('mobile');

    // document.getElementById('his_back').style.width = '70px';
    document.getElementById('his_back').classList.add('mobile');


    document.getElementById('clear_button').onclick = function(){document.getElementById('log').innerHTML = '';}


}
