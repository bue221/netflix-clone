import React,{ useState  } from 'react';
import './Row.css'
//material UI
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

const Row = ({ title, items})=>{

        const [margin, setMargin] = useState(-400);

        const right = ()=> {
                let x = margin - 150;
                let max = items.results.length *150;
                if((window.innerWidth - max) >x){
                        x= (window.innerWidth - max) - 60;
                }
                setMargin(x)

        } 

        const left = ()=> {
                let x = margin + 150;
                if(x >0){
                        x=0
                }
                setMargin(x)

        }

        return(
                <div className='movie'>
                        <h1>{title}</h1>
                        <div className="left" onClick={left}>
                                <ArrowBackIosIcon style={{ fontSize: 30  }} ></ArrowBackIosIcon>
                        </div>
                        <div className="right" onClick={right}>
                                <KeyboardArrowRightIcon style={{ fontSize: 50  }}></KeyboardArrowRightIcon>
                        </div>
                        <div className='movierow'>
                                <div className="row" style={{ marginLeft: margin, width: items.results.length * 150  }}>
                                        {
                                        items.results.map((i,key)=>(
                                        <div key={key} className='item'>
                                                <img src={`https://image.tmdb.org/t/p/w300${i.poster_path}`} alt={i.name ? i.name : i.title } />
                                                <p>{i.name ? i.name : i.title}</p>
                                        </div>
                                        ))
                                        }
                                </div>
                        </div>
                </div>
                );
}

export default Row; 
