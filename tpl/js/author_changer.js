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
					error: function(msg) {
						alert('서버와의 통신이 원활하지 않아 선택한 문서의 작성자 정보를 바꿀 수 없었습니다');
						$('#overlay').hide();
					}
				});
			});
		}, 0);
	});
});