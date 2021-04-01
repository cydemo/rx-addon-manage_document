jQuery(document).ready(function($) {
	$(document).on('click', '.target_list li a', function() {
		$(this).closest('.target_list').find('a.selected').removeClass('selected');
		$(this).addClass('selected');
	});

	$(document).on('click', '#execute', function() {
		var document_count = $('.document_list').length;
		if ( $('#member_list').find('a.selected').length < 1 )
		{
			alert('새로운 작성자를 선택해주세요.');
			return false;
		}

		$('#overlay').show();
		var member = $('#member_list').find('a.selected');
		var params = {
			nick_name : member.text(),
			member_srl : Number(member.data('member_srl')),
			user_id : member.data('user_id'),
			user_name : member.data('user_name'),
			email_address : member.data('email_address'),
			homepage : member.data('homepage'),
			apply_point : $('input#apply_point').is(':checked'),
			use_anonymous : $('input#use_anonymous').is(':checked')
		};
		setTimeout(function() {
			$('.document_list').find('input[name="cart"]').each(function(i) {
				params.document_srl = Number($(this).val());
				params.module_srl = Number($(this).data('module_srl'));
				params.original_member_srl = Number($(this).data('member_srl'));
				params.status = $(this).data('status');
				params.uploaded_count = Number($(this).data('uploaded_count'));
				$.ajax({
					url: './addons/manage_document/_author_changer.php',
					dataType: 'json',
					data: params,
					async: false,
					success: function() {
						if ( i + 1 === document_count )
						{
							alert('선택한 문서의 작성자 정보 바꾸기가 완료됐습니다!');
							if ( opener ) opener.location.reload();
							window.close();
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
						$('#overlay').hide();
					}
				});
			});
		}, 0);
	});
});