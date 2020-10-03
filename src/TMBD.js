// api TMDB
const API_KEY = 'c8092bbfc6c1ade73867b2e30c7323ea';
// base end-point
const API_BASE = 'https://api.themoviedb.org/3';

// funcion para no escribir tanto
const peticion = async (endpoint)=>{
        const res = await fetch(`${API_BASE}${endpoint}`);
        const json = await res.json();
        return json;
} 

//objeto que contiene casi toda la info *O*
export default {
        getHomeList: async ()=>{
                return [
                        {
                                slug: 'originals',
                                title: 'originales de netflix',
                                items: await peticion(`/discover/tv?with_network=213&language=pt-US&api_key=${API_KEY}`)
                        },
                        {
                                slug: 'trending',
                                title: 'Recomendados para ti',
                                items: await peticion(`/trending/all/week?language=pt-US&api_key=${API_KEY}`)
                        },
                        {
                                slug: 'toprated',
                                title: 'Top',
                                items: await peticion(`/movie/top_rated?language=pt-US&api_key=${API_KEY}`)
                        },
                        {
                                slug: 'action',
                                title: 'Accion',
                                items: await peticion(`/discover/movie?with_genres=28&language=pt-US&api_key=${API_KEY}`)
                        },
                        {
                                slug: 'comedy',
                                title: 'Comedia',
                                items: await peticion(`/discover/movie?with_genres=35&language=pt-US&api_key=${API_KEY}`)
                        },
                        {
                                slug: 'horror',
                                title: 'Terror',
                                items: await peticion(`/discover/movie?with_genres=27&language=pt-US&api_key=${API_KEY}`)
                        },
                        {
                                slug: 'romance',
                                title: 'Romance',
                                items: await peticion(`/discover/movie?with_genres=10749&language=pt-US&api_key=${API_KEY}`)
                        },
                        {
                                slug: 'documentary',
                                title: 'Documentales',
                                items: await peticion(`/discover/movie?with_genres=99&language=pt-US&api_key=${API_KEY}`)
                        }
                ]
        }
}
