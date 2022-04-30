import React, { useState, useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css'
import { BallTriangle } from 'react-loader-spinner';
import './Adoptions.css'
const BN = require("bn.js")
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faInfoCircle } from '@fortawesome/free-solid-svg-icons'

function Adoptions() {
    const [adoptions, setAdoptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(async () => {
        setLoading(true);
        console.log(window.contract);
        await window.contract.get_adoptions()
        .then((adoptions_res) => {
            setAdoptions(adoptions_res);
            setLoading(false);
            console.log(adoptions_res);
        })
    }, [])

    const responsive = {
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 3,
          slidesToSlide: 3 // optional, default to 1.
        },
        tablet: {
          breakpoint: { max: 1024, min: 464 },
          items: 2,
          slidesToSlide: 2 // optional, default to 1.
          
        },
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 1,
          slidesToSlide: 1 // optional, default to 1.
        }
      };

    return (
        <div>
            <div className="userAdoptions">
            <h1 style={{textAlign: 'center'}}>All Adopted Animals</h1>
            {loading && <BallTriangle color="#1e8bb8" loading={loading} /> }
            <Carousel responsive={responsive}>
                {adoptions.map((adoption, index) => {
                    return (
                        <div className="alluserAdoption" key={index}>
                            <h3>{adoption.name}</h3>
                            <p>Type: {adoption.animal}</p>
                            <p>Parent: {adoption.parent}</p>
                        </div>
                    )
                })}
            </Carousel>
            </div>
        </div>
    )
}

export default Adoptions;