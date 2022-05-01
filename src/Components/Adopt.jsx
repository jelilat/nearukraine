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
import ImageHelper from '../Utils/Image';
import Cat from '../assets/cat.png';
import Dog from '../assets/dog.png';

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
            setLoading(false)
            return;
        }
        
        if (description.name === '' || description.animal === '') {
            alert('Please fill out all fields');
            setLoading(false)
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
            setLoading(false)
            return;
        }
        console.log(id)

        await window.contract.feed_pet({
            id: id,
        },
        300000000000000, //gas estimate
        ONE_NEAR, //adoption fee
        )
        
    }

    const mint_nft = async (id, nft_status) => {
        setLoading(true);
        if (!window.walletConnection.isSignedIn()) {
            alert('You must be signed in to create a campaign');
            return;
        }

        if (nft_status) {
            alert("Already minted NFT")
            setLoading(false);
            return;
        }

        const token_id = id - 1;

        await window.contract.nft_mint({
            token_id: id.toString(),
            u_token_id: id,
            receiver_id: window.accountId,
        },
        300000000000000, //gas estimate
        new BN("100000000000000000000000"), //storage fee
        )
        setLoading(false);
    }

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
            <div className="userAdoptions" id="feed">
            <h1 style={{textAlign: 'center'}}>Your Animals</h1>
            {loading && <BallTriangle color="#1e8bb8" loading={loading} /> }
            {userAdoptions.length > 0 ? <Carousel responsive={responsive}>
                {userAdoptions.map((adoption, index) => {
                    return (
                        <div className="userAdoption" key={index}>
                            {/* <ImageHelper 
                                lastTimeFed={adoption.last_time_fed}
                                noOfTimesFed={adoption.total_times_fed} 
                                /> */}
                            <div className="image">
                                <img style={{width: 300}} src={adoption.animal == "cat" ? Cat : Dog} alt=""/>
                            </div>
                            <h3>{adoption.name}</h3>
                            <p>Type: {adoption.animal}</p>
                            <p>Parent: {adoption.parent}</p>
                            <p>Last fed: {timeAgo(adoption.last_time_fed)}</p>
                            <button onClick={() => {
                                feedAnimal(adoption.id)
                            }}>Feed Animal</button>
                            <button onClick={() => {
                                mint_nft(adoption.id, adoption.minted_nft)
                            }}>Mint NFT</button>
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
            <div className="adopt" id="adopt">
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