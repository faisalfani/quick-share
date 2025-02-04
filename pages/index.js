'use client';
import { useState, useEffect } from 'react';

export default function Index() {
  const randomBG = () => {
    const bgList = [
      "beach.jpg",
      "tokyo_night.jpg",
    ]
    return bgList[Math.floor(Math.random() * bgList.length)];
  }

  // Update background image every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade in and out
      document.getElementById("bg").classList.add("opacity-0");
      setTimeout(() => {
        document.getElementById("bg").classList.remove("opacity-0");
      }, 1000);

      document.getElementById("bg").src = randomBG();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const [loading, setLoading] = useState(false);

  const [blob, setBlob] = useState(null);

  const [base64, setBase64] = useState(null);

  const handleFileChange = async (event) => {
    event.preventDefault();

    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      const base64String = reader.result

      setBase64(base64String);
    };

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    console.log('called',response)
    const blob = await response.json()
    .catch((error) => {
      alert('Error: ' + error);
      // window.location.reload();
    });

    setBlob(blob);

    // Copy URL to clipboard
    navigator.clipboard.writeText(blob.url);

    setLoading(false);
  };

  return (
    <main className="relative w-screen h-screen text-white bg-black">
     
      <form
        id="form"
        encType="multipart/form-data"
        className="relative max-w-lg lg:max-w-2xl mx-auto h-screen flex flex-col justify-center space-y-6 z-[2] p-3"
      >
        <div className="pl-3">
          <h1 className="text-4xl font-black">Quick Share</h1>
          <h2 className="text-3xl font-bold">All formats accepted.</h2>
        </div>

        <input type="file" name="file" id="file" className="pl-3" onChange={handleFileChange} />

        {
          !loading && blob ? (
            <>
              {/* Remote Preview if it is img / audio / video */}
              {/* if is image */}
              {base64 && base64.includes('data:image') && (
                <img src={blob.url} className="rounded-xl max-h-[50vh] hover:scale-105 transition-all" />
              )}
              {/* if is audio */}
              {base64 && base64.includes('data:audio') && (
                <audio src={blob.url} controls className="rounded-xl max-h-[50vh] hover:scale-105 transition-all" />
              )}
              {/* if is video */}
              {base64 && base64.includes('data:video') && (
                <video src={blob.url} controls className="rounded-xl max-h-[50vh] hover:scale-105 transition-all" />
              )}
              <div
                className="rounded-xl bg-black text-sm p-5 font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                Share Preview to friend:
                <br />
                <a href={'/preview?q=' + blob.url.replace('https://public.blob.vercel-storage.com/', '')} target="_blank" className="text-xs block text-teal-400 hover:text-teal-600 transition-all">{window.location + 'preview?q=' + blob.url.replace('https://public.blob.vercel-storage.com/', '')}</a>
                <hr className="relative my-3 opacity-50" />
                Direct Download / Embed to your website:
                <br />
                <a href={blob.url} target="_blank" className="text-xs text-blue-400 hover:text-blue-600 transition-all">{blob.url}</a>
                <br />
                <span class="text-xs italic text-gray-600">🎯 Auto copied to your clipboard [Permission required]</span>
              </div>
            </>
          ) : (<>
            {/* Local Preview if it is img / audio / video */}
            {/* if is image */}
            {base64 && base64.includes('data:image') && (
              <img src={base64} className="rounded-xl hover:scale-105 max-h-[50vh] transition-all" />
            )}
            {/* if is audio */}
            {base64 && base64.includes('data:audio') && (
              <audio src={base64} controls className="rounded-xl hover:scale-105 max-h-[50vh] transition-all" />
            )}
            {/* if is video */}
            {base64 && base64.includes('data:video') && (
              <video src={base64} controls className="rounded-xl hover:scale-105 max-h-[50vh] transition-all" />
            )}

            {loading && (
              <div className="rounded-xl bg-black text-sm p-5 font-semibold shadow-sm animate-pulse hover:bg-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600">
                Processing your file, please wait...
              </div>
            )}
          </>)
        }

      </form>

      <img id="bg" src={ randomBG() } className={`fixed top-0 w-full h-full z-[1] object-cover filter ${base64 ? 'brightness-[0.1]' : 'brightness-50'} duration-1000 transition-all`} />
    
    </main>
  );
}