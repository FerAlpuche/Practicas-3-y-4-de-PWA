console.log("SW --> clean")

const CACHE_NAME = 'cache-v1';

const CACHE_STATIC_NAME = 'static-v1';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';
const CACHE_INMUTABLE_NAME = 'inmutable-v1';

function cleanCache(cacheName,sizeItems){
    caches.open(cacheName).then((cache)=>{
        cache.keys().then(keys=>{
            console.log(keys);
            if (keys.length >= sizeItems){
                cache.delete(keys[0]).then(()=>{
                    cleanCache(cacheName,sizeItems);
                });
            }
        });
    });
}

self.addEventListener('install',(event)=>{
    console.log("SW: installed");

    // Se crea el caché 
    const promesaCache = caches.open(CACHE_STATIC_NAME).then((cache)=>{
        return cache.addAll([
            '/',
            'index.html',
            'css/page.css',
            'img/img1.jpg',
            'js/app.js'
        ]);
    });

    const promeInmutable = caches.open(CACHE_INMUTABLE_NAME).then((cacheInmutable)=>{
        return cacheInmutable.addAll([
            'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css'
        ]);
    });

    
    event.waitUntil(Promise.all([promesaCache,promeInmutable]));
})

self.addEventListener('fetch',(event)=>{
    // Aui se busca en el cache y en caso de no encontrarlo se ira a la red 
    const respuestaCa = caches.match(event.request).then((res)=>{
        if (res){ // En caso de que el request este en elcaceh
            return res //respuesta con cache
        }

        console.log("El recurso no se encuentra en caché!",event.request.url);
        return fetch(event.request).then(resNet=>{
            // Aqui se abre el cache
            caches.open(CACHE_DYNAMIC_NAME).then(cache=>{
                cache.put(event.request,resNet).then(()=>{ // Se guarda la respuesta de la red en el caché
                    cleanCache(CACHE_DYNAMIC_NAME,4)
                })
            })
            return resNet.clone(); // Respuesta con el response de la red
        })
    })

    event.respondWith(respuestaCa);
})