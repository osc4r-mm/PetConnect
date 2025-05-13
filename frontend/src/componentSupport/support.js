import React from 'react';
import styled from 'styled-components';

const Switch = () => {
  return (
    <StyledWrapper>
      <div className="rating">
        <input type="radio" id="star5" name="rating" defaultValue={5} />
        <label htmlFor="star5" />
        <input type="radio" id="star4" name="rating" defaultValue={4} />
        <label htmlFor="star4" />
        <input type="radio" id="star3" name="rating" defaultValue={3} />
        <label htmlFor="star3" />
        <input type="radio" id="star2" name="rating" defaultValue={2} />
        <label htmlFor="star2" />
        <input type="radio" id="star1" name="rating" defaultValue={1} />
        <label htmlFor="star1" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .rating {
    display: inline-block;
    opacity: 1;
  }

  .rating input {
    display: none;
    opacity: 1;
  }

  .rating label {
    float: right;
    cursor: pointer;
    color: #ccc;
    transition: color 0.3s, transform 0.3s, box-shadow 0.3s;
  }

  .rating label:before {
    content: '\2605';
    font-size: 30px;
    transition: color 0.3s;
  }

  .rating input:checked ~ label,
  .rating label:hover,
  .rating label:hover ~ label {
    color: #ffc300;
    transform: scale(1.2);
    transition: color 0.3s, transform 0.3s, box-shadow 0.3s;
    animation: bounce 0.5s ease-in-out alternate;
  }

  @keyframes bounce {
    to {
      transform: scale(1.3);
    }
  }`;

export default Switch;
