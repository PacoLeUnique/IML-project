import cropImageData from "crop-image-data";

export function cropImage(image, X, Y){

    if(image == null){ return null; }

    let imagePieces = [];
    let widthOfOnePiece =  Math.round(image.width/X);
    let heightOfOnePiece = Math.round(image.height/Y);

    console.log("width of one piece :", widthOfOnePiece);
    console.log("height of one piece :", heightOfOnePiece);

    for(let x = 0; x < X; ++x) {
        for(let y = 0; y < Y; ++y) {

            const piece = cropImageData(image, {top:    heightOfOnePiece * y, 
                                                bottom: heightOfOnePiece * (Y - (y+1)),
                                                left:   widthOfOnePiece * x , 
                                                right:  widthOfOnePiece * (X - (x+1))});
            const binaryPiece = piece.data;
            const base64Piece = btoa(binaryPiece);
            
            imagePieces.push({"image" : piece, "thumbnail": base64Piece});
        }
    }
    
    return imagePieces;
}

