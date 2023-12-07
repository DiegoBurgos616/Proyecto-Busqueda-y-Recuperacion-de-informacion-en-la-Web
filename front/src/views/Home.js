import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';

function Home() {

    const [searchResult, setSearchResult] = useState([]);
    const [search, setSearch] = useState('');
    const [expandWords, setExpandWords] = useState([]);
    const [suggests, setSuggests] = useState([]);
    const [spell, setSpell] = useState([]);

    const fetchSearch = async (search) => {
        let data;
        try {
            //si no hay palabra presente todo muere
            if(!search){
                setSpell([]);
                setExpandWords([]);
                setSearchResult([]);
                return;
            }
            //consulta la corrección de palabras
            let spell_words = await fetch('http://localhost:8983/solr/briwtest/spell?q=' + search);
            let _spell = await spell_words.json();
            console.log(_spell);
            //verifica la existencia de sugerencias y actualiza el estado
            if(_spell.spellcheck){
                setSpell(_spell.spellcheck.suggestions.length ? _spell.spellcheck.suggestions[1].suggestion : []);
            }else{
                setSpell([]);
            }
            //expande las busqueda 
            let expand_words = await fetch('https://api.datamuse.com/words?ml=' + search + '&v=es&max=10');
            let words = await expand_words.json()
            setExpandWords(words ? words : [])
            let expand_search = search;
            for (let index = 0; index < words.length; index++) {
                expand_search = expand_search + " OR " + words[index].word;

            }
            console.log(expand_search ? expand_search : []);

            //realiza la busqueda de las palabras expandidas
            data = await fetch('http://localhost:8983/solr/briwtest/select?rows=100&fl=*%2Cscore&q=' + expand_search);
            const items = await data.json();
            console.log(items.response.docs);
            setSearchResult(items.response.docs);
        } catch (err) {
            console.log(err);
        }

    };

    const searchChangeHandler = (event) => {
        setSearch(event.target.value);
    }
    
    useEffect(async () => {
        try {
            let data = await fetch('http://localhost:8983/solr/briwtest/suggest?suggest=true&suggest.build=true&suggest.dictionary=default&wt=json&suggest.q=' + search);
            const result = await data.json();
            console.log(search);
            console.log(result.suggest.default[search].suggestions);
            setSuggests(result.suggest.default[search].suggestions)
        } catch (err) {
            console.log(err);
        }
    }, [search]);

    const SubmitHandler = (event) => {
        event.preventDefault();
        fetchSearch(search)
    }

    return (
        <div>
            <div className="container mt-5">
                <h1 className="animate__animated animate__bounceInLeft animate__delay-.5s text-center">BRIW</h1>
            </div>
            <div className="container mt-5 mx-auto" style={{ width: "800px" }}>

                <div className="container-fluid">
                    <form className="d-flex" onSubmit={SubmitHandler}>
                        <input className="form-control " list="datalistOptions" type="search" placeholder="Search" aria-label="Search" value={search} onChange={searchChangeHandler} />
                        <datalist id="datalistOptions">
                            {suggests.map(suggest => (
                                <option value={suggest.term} />
                            ))}
                        </datalist>
                        <button className="btn btn-outline-primary" type='submit' >Search</button>
                    </form>
                </div>
            </div>

            <div className="container mt-2" style={{ width: "700px" }}>
                {expandWords.map((word,key) => (
                    <a key={key} href="#" className="btn btn-secondary btn-sm disabled mt-1 ml-2" role="button" aria-disabled="true">{word.word}</a>
                ))}
            </div>

            <div className="container mt-2" style={{ width: "700px" }}>
                {!spell.length ? '' : <div className="card">
                    <div className="card-body">
                        Quizás quisiste decir: {spell.map((item) => (item.word + ' '))}
                    </div>
                </div>
                }
            </div>
            {!searchResult.length ? '' : <div className="container mt-2" style={{ width: "700px" }}>
                <h3 className="animate__animated animate__bounceInLeft animate__delay-.1s" >Resultados</h3>
            </div>}

            {searchResult.map(doc => (
                <div key={doc.id} className="container-sm mt-2 mx-auto" style={{ width: "700px" }} >
                    <div className="list-group">
                        <a href={doc.link} className="list-group-item list-group-item-action " aria-current="true">
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1">{doc.titulo_es[0]}</h5>
                            </div>
                            <p className="mb-1">{doc.snippet[0]}</p>
                            <small>score: {doc.score}</small>
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}
export default Home;