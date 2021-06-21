$(document).ready(function(){
    
    $('#myTable').DataTable({
        "responsive": true,
        "info": false,
        "lengthChange": false,
        "pageLength": 2,
        "autoWidth": false,
    
     

    });

    $('.edit-btn').on('click',function(){
        var button_value = $(this).val()
    
        $.ajax({
            url: '/getEditInfo', 
            method: 'POST',           
            contentType: 'application/json',
            data: JSON.stringify({new_id:button_value}),
            success: function(data){
    
                $('.edit-input').val(data.description)
                $('.edit-input-2').val(data._id)
            }            
    
        })
    



    })


    $(".alert-success").fadeTo(2000, 500).slideUp(500, function(){
        $(".alert-success").slideUp(500);
    });

    $(".alert-danger").fadeTo(2000, 500).slideUp(500, function(){
        $(".alert-danger").slideUp(500);
    });
 





});