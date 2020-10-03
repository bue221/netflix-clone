import React from 'react';
import './Header.css';

const Header = ({ data  })=>{

		let year = new Date(data.first_air_date);
		let genres = [];
		for(let i in data.genres){
			genres.push(data.genres[i].name);
		}

        return(
                <section className="header" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${data.backdrop_path})`  }}>
                        <div className='vertical'>
	                        <div className='horizontal'>
	                        	<div className='name'>{data.original_name}</div>
	                        	<div className='info'>
	                        		<div className='points'>{data.vote_average} puntos</div>
	                        		<div className='year'>{year.getFullYear()}</div>
	                        		<div className='seasons'>{data.number_of_seasons} Temporadas</div>
	                        	</div>
	                        	<div className='description'>
	                        		{data.overview}
	                        	</div>
	                            <div className='botones'>
	                        		<a href={`/wacth/${data.id}`} className='ver' > * Ver </a>
	                        		<a href={`/list/add${data.id}`} className='lista'> + Mi lista </a>
	                        	</div>
	                        	<div className='generos'>
	                        		<strong>Géneros</strong> {genres.join(',')}
	                        	</div>
	                        </div>
                        </div>
                </section>
                );
}

export default Header;
