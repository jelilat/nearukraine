import React, { useState, useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css'
import { BallTriangle } from 'react-loader-spinner';
import './Adoptions.css'
const BN = require("bn.js")
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import Cat from '../assets/cat.png';
import Dog from '../assets/dog.png';

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

      const imageSize = (lastTimeFed, noOfTimesFed) => {
        const timeDifference = Date.now() - (lastTimeFed/1000000)
        const day = (timeDifference/1000)/86400
        const weight = 10 * noOfTimesFed/day
        console.log(weight)
        if (weight > 300) {
            return 300
        } else {
            return Math.floor(weight)
        }
    }

    return (
        <div>
            <div className="userAdoptions">
            <h1 style={{textAlign: 'center'}}>All Adopted Animals</h1>
            {loading && <BallTriangle color="#1e8bb8" loading={loading} /> }
            <Carousel responsive={responsive}>
                {adoptions.map((adoption, index) => {
                    return (
                        <div className="alluserAdoption" key={index}>
                            <div className="image">
                                <img style={{width: 300}} src={adoption.animal == "cat" ? Cat : Dog} alt=""/>
                            </div>
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