import cropImageData from "crop-image-data";

/*function cutImageUp() {
    let imagePieces = [];
    for(let x = 0; x < numColsToCut; ++x) {
        for(var y = 0; y < numRowsToCut; ++y) {
            var canvas = document.createElement('canvas');
            canvas.width = widthOfOnePiece;
            canvas.height = heightOfOnePiece;
            var context = canvas.getContext('2d');
            context.drawImage(image, x * widthOfOnePiece, y * heightOfOnePiece, widthOfOnePiece, heightOfOnePiece, 0, 0, canvas.width, canvas.height);
            imagePieces.push(canvas.toDataURL());
        }
    }

    // imagePieces now contains data urls of all the pieces of the image

    // load one piece onto the page
    let anImageElement = document.getElementById('myImageElementInTheDom');
    anImageElement.src = imagePieces[0];
}*/

/** CropImage
 *  image : Stream<ImageData>
*/
export function cropImage(image, X, Y){
    let imagePieces = [];
    let widthOfOnePiece = image.width/X;
    let heightOfOnePiece = image.height/Y;

    for(let x = 0; x < X; ++x) {
        for(let y = 0; y < Y; ++y) {

            const piece = cropImageData(image, {top:5, bottom:5});
            imagePieces.push(piece);
 //           context.drawImage(image, x * widthOfOnePiece, y * heightOfOnePiece, widthOfOnePiece, heightOfOnePiece, 0, 0, canvas.width, canvas.height);

        }
    }
    

    return imagePieces;
}

