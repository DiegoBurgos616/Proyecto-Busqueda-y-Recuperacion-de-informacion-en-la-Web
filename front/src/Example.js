import React from 'react';

function Example() {
  return (
    <div class="container mt-5">
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <h1 class="animate__animated animate__bounce animate__infinite" >Oh snap! You got an error!</h1>
        <p>
          Change this and that and try again.
      </p>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          
        </div>
      </div>
    </div>

  )
}
export default Example;