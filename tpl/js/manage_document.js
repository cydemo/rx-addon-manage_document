jQuery(document).ready(function($) {
	var current_module_srl = $('input[name="target_module_srl"]').val();
	doGetCategoryFromModule(current_module_srl);

	$(document).on('click', '.target_list li a', function() {
		var module_srl = $(this).data('module_srl');
		doGetCategoryFromModule(module_srl);
		$('input[name="target_module_srl"]').val(module_srl);

		$(this).closest('.target_list').find('a.selected').removeClass('selected');
		$(this).addClass('selected');
	});

	var message_content_area = $('#message_content');
	if ( $('#send_default_message').is(':checked') ) {
		message_content_area.prop('disabled', true);
	}
	$(document).on('change', '#send_default_message', function(){
		if ( $(this).is(':checked') ) {
			message_content_area.prop('disabled', true);
		} else {
			message_content_area.prop('disabled', false);
		}
	});
	
});

/* 선택된 글의 삭제 또는 이동 */
function doManageDocument(type) {
	if ( type === 'move' || type === 'copy' ) {
		if ( $('.target_list').find('a.selected:visible').length === 0 ) {
			alert('게시판을 선택한 뒤 이동 또는 복사를 실행해주십시오.');
			return false;
		}
	}
	var document_srls = [];
	$('.document_list').find('input[name="cart"]').each(function() {
		document_srls.push($(this).val());
	});
	document_srls.sort(function(a, b) {
		return a - b;
	});

    var fo_obj = $('#fo_management').get(0);
	fo_obj.cart.value = document_srls.join('|@|');
    fo_obj.type.value = type;

    procFilter(fo_obj, manage_checked_document);
}

/* 선택된 글의 삭제 또는 이동 후 */
function completeManageDocument(ret_obj) {
    if(opener) { 
        opener.window.location.href = opener.window.current_url.setQuery('document_srl', '');
    }
    alert(ret_obj['message']);
    window.close();
}

/* 선택된 모듈의 카테고리 목록을 가져오는 함수 */
function doGetCategoryFromModule(module_srl) {
    var params = new Array();
    params['module_srl'] = module_srl;

    var response_tags = ['error','message','categories'];

    exec_xml('document','getDocumentCategories',params, completeGetCategoryFromModules, response_tags);
}

function completeGetCategoryFromModules(ret_obj, response_tags) {
    var obj = $('#target_category');
	obj.find('option').remove();

    var categories = ret_obj['categories'];
    if(!categories) return;

	var depth_str = '-';
	for(var i=0; i < 5; i++) depth_str += depth_str;

    var category_list = categories.split("\n");
    for(var i=0;i<category_list.length;i++) {
        var item = category_list[i];

        var pos = item.indexOf(',');
        var category_srl = item.substr(0,pos);

        var item = item.substr(pos+1, item.length);
        var pos = item.indexOf(',');
        var depth = item.substr(0,pos);

        var category_title = item.substr(pos+1,item.length);
        if(!category_srl || !category_title) continue;

		if (depth > 0) category_title = depth_str.substr(0, depth) + ' ' + category_title;
		obj.append('<option value="' + category_srl + '">' + category_title.escape(false) + '</option>');
   }
}