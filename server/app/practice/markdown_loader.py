import fitz

print("A")

document = fitz.open("files\sample.pdf")
page = document.load_page(0)

dpi = 300
zoom_x = dpi / 72
zoom_y = dpi / 72
matrix = fitz.Matrix(zoom_x, zoom_y)
pixmap = page.get_pixmap(matrix=matrix)

pixmap.save("images\page_300dpi.png")
print("Success")
