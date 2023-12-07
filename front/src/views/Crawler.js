import React, { useState, useEffect } from "react";
import { MdDeleteForever } from "react-icons/md";
import { GrAdd } from "react-icons/gr";
import { AiOutlineSave } from "react-icons/ai";
import { GoX } from "react-icons/go";
import { Link } from "react-router-dom";
import './Crawler.css';



function Crawler() {
  const [links, setLinks] = useState([]);
  const [addNewLink, setNewLink] = useState(false);
  const [inputLink, setInputLink] = useState('');
  const [crawler, setCrawler] = useState(false);
  const [facet,setFacer]=useState('')
  useEffect(async () => {
    try {
      const result = await getLinks();
      setLinks(result);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const getLinks = async () => {
    let data = await fetch("http://localhost/crawler/links/links.php");
    const result = await data.json();
    console.log(result);
    return result;
  };
  const updateLinks = async (data) => {
    console.log(data);
    let res = await fetch("http://localhost/crawler/links/saveLinks.php", {
      method: "POST", // or 'PUT'
      body: JSON.stringify({"links":data}), // data can be `string` or {object}!
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    });
    let result=await res.json();
    console.log(result);
    return res;
  };
  const deleteLinkById = async (id) => {
    const cloneLinks = [...links];
    console.log(id);
    cloneLinks.splice(id, 1);
    await updateLinks(cloneLinks);
    let result=await getLinks();
    setLinks(result);
  };

  const NewLink = () => {
  
    setNewLink(true);
  };

  
  const saveNewLink=async(value)=>{
    const cloneLinks = [...links];
    cloneLinks.push(inputLink);
    await updateLinks(cloneLinks);
    let result=await getLinks();
    setLinks(result);
    setInputLink('');
  }
  const ChangeInputHandler = (event) => {
    setInputLink(event.target.value);
}
const startCrawler=async()=>{
  setCrawler(true);
  let result;
  try{
    let data = await fetch("http://localhost/crawler/executeCrawler.php");
    result= await data.json();
    console.log(result);
    setCrawler(false);
  }catch(err){
    setCrawler(false);
    console.log(err);
  }
 
  return result;
  
}
 return (
    <div className="container mt-5">
      <h1 className="animate__animated animate__bounceInLeft animate__delay-.5s text-center">
        Crawler
      </h1>
      <div className="container mt-5 mx-auto" style={{ width: "800px" }}>
        <div className="card">
          <h5 className="card-tittle mx-auto">Lista de links</h5>
          <div className="Card-body p-3">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Link</th>
                  <th scope="col">Delete</th>
                </tr>
              </thead>
              {links.map((link, key) => (
                <tbody key={key}>
                  <tr>
                    <th style={{ verticalAlign: "middle" }} scope="row">
                      {key}
                    </th>
                    <td style={{ verticalAlign: "middle" }}>{link}</td>
                    <td
                      style={{ verticalAlign: "middle", textAlign: "center" }}
                    >
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => deleteLinkById(key)}
                      >
                        <MdDeleteForever />
                      </button>
                    </td>
                  </tr>
                </tbody>
              ))}
            </table>
            {addNewLink ? (
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="New Link"
                  value={inputLink}
                  onChange={ChangeInputHandler}
                />
                <button className="btn btn-outline-secondary" type="button" onClick={()=>{saveNewLink()}}>
                  <AiOutlineSave />
                </button>
                <button className="btn btn-outline-secondary" type="button" onClick={()=>{setNewLink(false)}}>
                  <GoX />
                </button>
              </div>
            ) : (
              ""
            )}
            <div style={{ margin: "auto", textAlign: "center" }}>
              <button
                onClick={() => NewLink()}
                className="btn btn-outline-secondary"
                type="button"
                style={{ minWidth:"500px",width:'100%'}} 
              >
                <GrAdd style={{ minWidth:"500px",width:'100%'}} />
              </button>
              
            </div>
            <div className="mt-5" style={{ margin: "auto", textAlign: "center" }}>
              <button
                onClick={() => startCrawler()}
                className="btn btn-outline-secondary animate__animated animate__bounce animate__repeat-2"
                type="button"
                style={{ minWidth:"500px",width:'100%'}} 
              >
                Start Crawler
              </button>
              
            </div>
            {crawler?<div className="d-flex justify-content-center mt-3">
            <div className="spinner-border" role="status">
            </div>
          </div>:''}
            
          </div>
        </div>
      </div>
    </div>
  );
}
export default Crawler;
