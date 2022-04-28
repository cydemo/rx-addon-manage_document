var addedDocument = [];

function removeDocumentCart(obj) {
	var srl = obj.previousSibling.previousSibling.previousSibling.previousSibling.value;
	addedDocument[addedDocument.length] = srl;
	setTimeout(function() { callRemoveDocumentCart(addedDocument.length); }, 100);
}

function callRemoveDocumentCart(document_length) {
	if ( addedDocument.length < 1 || document_length != addedDocument.length ) {
		return;
	}

	var params = [];
	params.srls = addedDocument.join(',');
	var container = $('.x_modal-body').children('.x_control-group').first();

	exec_json('document.procDocumentAddCart', params, function() {
		reloadDocumentCart(container);
	});
	addedDocument = [];
}

function reloadDocumentCart(container) {
	$.ajax({
		url: location.href,
		dataType: 'html',
		success: function(data) {
			var manage_type = current_url.getQuery('manage_type');
			var body = $('<div/>').html(data).contents().find('.x_modal-body');
			var collected = body.children('.x_control-group').first();

			var module_count = container.children('.x_control-label').data('module_count');
			var extra_changable = ( module_count > 1 ) ? true : false;

			if ( collected.find('.document_list').length > 0 ) {
				var selectedContent = collected.html();
				container.html(selectedContent);

				module_count = container.children('.x_control-label').data('module_count');
				if ( manage_type === 'extra_vars_changer' && extra_changable && module_count === 1 ) {
					location.reload();
				}
			} else {
				location.reload();
			}
		},
		error: function(x,e) {
			if ( x.status == 0 ) {
				alert('네트워크 연결 상태를 체크해주세요.');
			} else if ( x.status == 404 ) {
				alert('요청받은 URL을 찾을 수 없습니다.');
			} else if ( x.status == 500 ) {
				alert('내부 서버 오류');
			} else if ( e == 'parsererror' ) {
				alert('요청받은 내용을 변환하는 실패했습니다.');
			} else if ( e == 'timeout' ) {
				alert('연결 시간이 초과했습니다.');
			} else {
				alert('알 수 없는 에러가 발생했습니다.\n' + x.responseText);
			}
		}
	});
};