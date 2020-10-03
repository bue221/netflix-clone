import React,{ useState, useEffect } from 'react';
import TMBD from './TMBD';
//styles
import './App.css';
import CircularProgress from '@material-ui/core/CircularProgress';
//components
import Row from './components/Row/Row';
import Header from './components/Header/Header';
import Nav from './components/Nav/Nav';

const App = ()=>{

        const [data, setData ] = useState([]);
        const [done, setDone] = useState(false)
        const [headerData, setHeaderData ] = useState([]);
        const [color, setColor ]= useState(false);
        useEffect(()=>{
                const loadData =  async()=>{
                        let lista = await TMBD.getHomeList();
                        console.log(lista);
                        setDone(true);
                        setData(lista);

                        let header = lista.filter( i=> i.slug === 'originals');
                        let random = Math.floor(Math.random() * (header[0].items.results.length -1));
                        let escogida = header[0].items.results[random];

                        console.log(escogida);
                        setHeaderData(escogida);
                }
                loadData();
        },[]);

        useEffect(()=>{
                const scrollListener = () =>{
                        if(window.scrollY > 15){
                                setColor(true);
                        }else{
                                setColor(false);
                        }
                }
                
                window.addEventListener('scroll', scrollListener);

                return () =>{
                  window.removeEventListener('scroll', scrollListener);
                  };
                
        },[])

        const Listas = ()=>{
                return(
                        <>
                                {data.map((i, key)=>(  
                                <Row key={key} title={i.title} items={i.items} />
                                ))
                                }
                        </>
                        );
        }

        return(
                <div className="page">
                {done ?
                       (<>
                        <Nav color={color} />
                        <Header data={headerData} />
                        <section className="lists">
                                <Listas />
                        </section></>) : 
                        (
                                <div className="circular">
                                        <CircularProgress color="secondary" />
                                </div>
                        ) }
                </div>
                );
}

export default App;
