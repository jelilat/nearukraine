import "regenerator-runtime/runtime";
import React, { useState, useEffect } from 'react';
import "./Adopt.css";
const BN = require("bn.js");
import { create } from 'ipfs-http-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css'
import { BallTriangle } from 'react-loader-spinner';
import { timeAgo } from '../Utils/Dateconverter';

export default function Adopt() {
    const client = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    const [file, setFile] = useState()
    const [userAdoptions, setUserAdoptions] = useState([])
    const [description, setDescription] = useState({
      name: '',
      animal: '',
    });
    const [loading, setLoading] = useState(false);
    const ONE_NEAR = new BN("1000000000000000000000000");

    useEffect(async() => {
        setLoading(true);
        if(window.accountId) {
            await window.contract.get_adoptions_by_parent({
                parent: window.accountId
            })
            .then((adoptions_res) => {
                if (adoptions_res.length > 0) {
                    setUserAdoptions(adoptions_res);
                }
                console.log(adoptions_res)
            })
        }
        setLoading(false);
    }, [window.accountId])

    const updateDescription = () => {
        const name = document.getElementById('title');
        const animal = document.getElementById('animal');
        setDescription({
            name: name.value,
            animal: animal.value,
        })
    }

    const adoptAnimal = async () => {
        setLoading(true);
        if (!window.walletConnection.isSignedIn()) {
            alert('You must be signed in to create a campaign');
            return;
        }
        
        if (description.name === '' || description.animal === '') {
            alert('Please fill out all fields');
            return;
        } 

        await window.contract.adopt_pet({
            name: description.name,
            animal: description.animal,
        },
        300000000000000, //gas estimate
        ONE_NEAR, //adoption fee
        )
        
    }

    const feedAnimal = async (id) => {
        setLoading(true);
        if (!window.walletConnection.isSignedIn()) {
            alert('You must be signed in to create a campaign');
            return;
        }
        console.log(id)

        await window.contract.feed_pet({
            id: id - 1,
        },
        300000000000000, //gas estimate
        ONE_NEAR, //adoption fee
        )
        
    }

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

    return(
        <div>
            <div className="userAdoptions">
            <h1 style={{textAlign: 'center'}}>Your Animals</h1>
            {loading && <BallTriangle color="#1e8bb8" loading={loading} /> }
            {userAdoptions.length > 0 ? <Carousel responsive={responsive}>
                {userAdoptions.map((adoption, index) => {
                    return (
                        <div className="userAdoption" key={index}>
                            <h3>{adoption.name}</h3>
                            <p>Type: {adoption.animal}</p>
                            <p>Parent: {adoption.parent}</p>
                            <p>Last fed: {timeAgo(adoption.last_time_fed)}</p>
                            <button onClick={() => {
                                feedAnimal(adoption.id)
                            }}>Feed Animal</button>
                            <button>Mint NFT</button>
                        </div>
                    )
                })}
            </Carousel> 
            : <div>
                {window.accountId ?
                <p style={{textAlign: 'center', color: 'red'}}>You have not adopted any animal</p>
                : <p style={{textAlign: 'center', color: 'red'}}>Sign in to see your adopted animals</p>}
              </div>}
            </div>
            <div className="adopt">
                <h1 style={{textAlign: 'center'}}>Adopt Animal</h1>
                <div>
                    <label>Name your pet</label><br />
                    <input type="text" name="title" placeholder="e.g. Qeuw" id="title" onChange={updateDescription} /> <br />
                    <label>Select Animal</label><br />
                    <select name="animal" id="animal" onChange={updateDescription}>
                        <option value="cat">Cat</option>
                        <option value="dog">Dog</option>
                    </select><br />
                    <button onClick={adoptAnimal} disabled={loading} className="create-button">
                        Adopt Animal {loading && <FontAwesomeIcon icon={faSpinner} />}
                        </button>
                </div>
            </div>
        </div>
    )
}